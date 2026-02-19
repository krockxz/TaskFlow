'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/constants/filters';

interface BulkActionBarProps {
  selectedIds: string[];
  users: { id: string; email: string }[];
  onClearSelection: () => void;
}

export function BulkActionBar({ selectedIds, users, onClearSelection }: BulkActionBarProps) {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Bulk mutation
  const { mutate: bulkAction, isPending } = useMutation({
    mutationFn: async ({ action, payload }: { action: string; payload?: any }) => {
      const res = await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds: selectedIds, action, payload }),
      });
      if (!res.ok) throw new Error('Failed to perform bulk action');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all task queries (with and without filters)
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClearSelection();
    },
  });

  const handleStatusChange = (status: string) => {
    bulkAction({ action: 'changeStatus', payload: { status } });
  };

  const handlePriorityChange = (priority: string) => {
    bulkAction({ action: 'changePriority', payload: { priority } });
  };

  const handleReassign = (assignedTo: string) => {
    bulkAction({ action: 'reassign', payload: { assignedTo } });
  };

  const handleDelete = () => {
    bulkAction({ action: 'delete' }, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        onClearSelection();
      },
    });
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg z-50">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {selectedIds.length} task{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Change Status */}
            <Select
              value=""
              onValueChange={handleStatusChange}
              disabled={isPending}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Change status..." />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Change Priority */}
            <Select
              value=""
              onValueChange={handlePriorityChange}
              disabled={isPending}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Change priority..." />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reassign */}
            <Select
              value=""
              onValueChange={handleReassign}
              disabled={isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reassign..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Delete */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
            >
              Delete
            </Button>

            {/* Cancel */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isPending}
            >
              Cancel
            </Button>

            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} task{selectedIds.length !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected tasks will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Spacer to prevent content from being hidden behind fixed bar */}
      <div className="h-20" />
    </>
  );
}
