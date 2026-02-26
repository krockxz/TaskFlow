'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCommand } from '@/components/command/CommandContext';
import { CheckCircle, UserPlus, Trash2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/ui/user-avatar';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';
import type { CommandAction, TaskStatus } from '@/lib/types';

// Valid task status values matching the Prisma enum
const VALID_STATUSES: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE'];

// Status display mapping
const STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  READY_FOR_REVIEW: 'Ready for Review',
  DONE: 'Done',
};

// Status color mapping
const STATUS_COLORS: Record<TaskStatus, string> = {
  OPEN: 'bg-gray-500/10 text-gray-500',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500',
  READY_FOR_REVIEW: 'bg-yellow-500/10 text-yellow-500',
  DONE: 'bg-green-500/10 text-green-500',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { registerAction, unregisterAction } = useCommand();
  const { toast, success, error } = useToast();
  const taskId = params.id as string;

  // Fetch task data
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Users for assignment
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    const supabase = createClient();

    async function loadTask() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error loading task:', error);
        setLoadError(error.message || 'Failed to load task');
        setLoading(false);
        return;
      }

      setTask(data);
      setLoading(false);
    }

    loadTask();
  }, [taskId]);

  // Fetch users for assignment dropdown
  useEffect(() => {
    async function fetchUsers() {
      setUsersLoading(true);
      try {
        const response = await fetch('/api/users?pageSize=100');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setUsersLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Update task status via API
  const updateStatus = useCallback(async (newStatus: TaskStatus) => {
    if (!task) return;
    setActionLoading('status');

    try {
      const response = await fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      setTask({ ...task, status: newStatus });
      success(`Status updated to ${STATUS_LABELS[newStatus]}`);
    } catch (err) {
      console.error('Error updating status:', err);
      error(err instanceof Error ? err.message : 'Failed to update status', 'Status Update Failed');
    } finally {
      setActionLoading(null);
    }
  }, [task, taskId, success, error]);

  // Assign task via API
  const assignTask = useCallback(async (userId: string) => {
    if (!task) return;
    setActionLoading('assign');

    try {
      const response = await fetch('/api/tasks/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, assignedTo: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign task');
      }

      setTask({ ...task, assigned_to: userId });
      success('Task assigned successfully');
    } catch (err) {
      console.error('Error assigning task:', err);
      error(err instanceof Error ? err.message : 'Failed to assign task', 'Assignment Failed');
    } finally {
      setActionLoading(null);
    }
  }, [task, taskId, success, error]);

  // Delete task via API
  const deleteTask = useCallback(async () => {
    if (!task) return;
    setActionLoading('delete');

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      success('Task deleted successfully');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting task:', err);
      error(err instanceof Error ? err.message : 'Failed to delete task', 'Deletion Failed');
      setActionLoading(null);
    }
  }, [task, taskId, router, success, error]);

  // Smart back navigation - try to use history, fall back to dashboard
  const handleBack = useCallback(() => {
    // Check if we have a valid referrer in sessionStorage
    const referrer = sessionStorage.getItem('taskReferrer');
    if (referrer) {
      sessionStorage.removeItem('taskReferrer');
      router.push(referrer);
      return;
    }

    // Check if there's actual history to go back to
    // If the user came directly to this page (e.g., via URL), history.length may be 1
    if (window.history.length > 1) {
      router.back();
    } else {
      // No history, go to dashboard
      router.push('/dashboard');
    }
  }, [router]);

  // Register task-specific actions
  useEffect(() => {
    if (!task) return;

    const actions: CommandAction[] = [
      {
        id: `task-${task.id}-status`,
        label: 'Change Status',
        icon: CheckCircle,
        context: 'task',
        keywords: ['status', 'change', 'update'],
        onSelect: () => {
          setPendingStatus(task.status as TaskStatus);
          setStatusDialogOpen(true);
        },
      },
      {
        id: `task-${task.id}-assign`,
        label: 'Assign Task',
        icon: UserPlus,
        context: 'task',
        keywords: ['assign', 'user', 'owner'],
        onSelect: () => {
          setSelectedUserId(task.assigned_to || '');
          setAssignDialogOpen(true);
        },
      },
      {
        id: `task-${task.id}-delete`,
        label: 'Delete Task',
        icon: Trash2,
        context: 'task',
        keywords: ['delete', 'remove'],
        onSelect: () => {
          setDeleteDialogOpen(true);
        },
      },
    ];

    // Register all actions
    actions.forEach(action => registerAction(action));

    // Cleanup on unmount
    return () => {
      actions.forEach(action => unregisterAction(action.id));
    };
  }, [task, registerAction, unregisterAction]);

  // Handle status change confirmation
  const handleStatusChange = useCallback(() => {
    if (pendingStatus && pendingStatus !== task?.status) {
      updateStatus(pendingStatus);
    }
    setStatusDialogOpen(false);
  }, [pendingStatus, task, updateStatus]);

  // Handle assignment confirmation
  const handleAssignChange = useCallback(async () => {
    if (selectedUserId && selectedUserId !== task?.assigned_to) {
      await assignTask(selectedUserId);
    }
    setAssignDialogOpen(false);
  }, [selectedUserId, task, assignTask]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    deleteTask();
    setDeleteDialogOpen(false);
  }, [deleteTask]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading task...</div>
      </div>
    );
  }

  if (loadError || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Failed to load task</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {loadError || 'Task not found'}
          </p>
        </div>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[task.status as TaskStatus] || STATUS_COLORS.OPEN;
  const statusLabel = STATUS_LABELS[task.status as TaskStatus] || task.status;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <div className="flex items-center gap-2">
              {actionLoading === 'status' && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{task.description || 'No description'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                <p className="text-sm capitalize">{task.priority?.toLowerCase() || 'No priority'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Assigned To</h3>
                <p className="text-sm">{task.assigned_to || 'Unassigned'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
              <p className="text-sm">{new Date(task.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              Press Cmd+K to open command palette for task actions
            </p>
          </div>
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Task Status</DialogTitle>
            <DialogDescription>
              Select a new status for &ldquo;{task?.title}&rdquo;. Current status is {statusLabel}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="status-select">New Status</Label>
            <Select
              value={pendingStatus || task?.status}
              onValueChange={(value) => setPendingStatus(value as TaskStatus)}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {VALID_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status].split(' ')[0]}`} />
                      {STATUS_LABELS[status]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={!pendingStatus || pendingStatus === task?.status || actionLoading === 'status'}
            >
              {actionLoading === 'status' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Select a user to assign &ldquo;{task?.title}&rdquo; to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="assignee-select">Assignee</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={usersLoading}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select a user'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span className="text-muted-foreground">Unassigned</span>
                </SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <UserAvatar email={user.email} className="h-5 w-5" fallbackClassName="text-xs" />
                      <span>{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignChange}
              disabled={!selectedUserId || selectedUserId === task?.assigned_to || actionLoading === 'assign'}
            >
              {actionLoading === 'assign' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Task'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{task?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === 'delete'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={actionLoading === 'delete'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === 'delete' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
