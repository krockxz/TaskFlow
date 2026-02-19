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
import { motion, AnimatePresence } from 'motion/react';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/constants/filters';

interface BulkActionBarProps {
  selectedIds: string[];
  users: { id: string; email: string }[];
  onClearSelection: () => void;
}

/**
 * BulkActionBar Component
 *
 * Fixed bottom bar that appears when tasks are selected.
 * Provides bulk actions: change status, priority, reassign, delete.
 * Enhanced with slide-up animation and backdrop blur effect.
 */

// Bar animation variants
const barVariants = {
  hidden: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

// Content animation (staggered children)
const contentVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as const,
      delay: 0.05,
    },
  },
};

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
      <AnimatePresence>
        {/* Fixed bottom bar with slide-up animation */}
        <motion.div
          key="bulk-action-bar"
          variants={barVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          {/* Backdrop blur overlay */}
          <div className="absolute inset-0 border-t bg-background/95 backdrop-blur-md" />

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="relative px-4 py-4 shadow-lg"
          >
            <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
              {/* Selection count with animation */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  key={`count-${selectedIds.length}`}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-medium"
                >
                  {selectedIds.length} task{selectedIds.length !== 1 ? 's' : ''} selected
                </motion.span>
              </motion.div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Change Status */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
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
                </motion.div>

                {/* Change Priority */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.175 }}
                >
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
                </motion.div>

                {/* Reassign */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
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
                </motion.div>

                {/* Delete Button with scale animation on hover */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.225 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </motion.div>

                {/* Cancel Button with scale animation on hover */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSelection}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </motion.div>

                {/* Loading spinner with pulse animation */}
                <AnimatePresence>
                  {isPending && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Dynamic spacer to prevent content from being hidden behind fixed bar */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '80px' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>

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
    </>
  );
}
