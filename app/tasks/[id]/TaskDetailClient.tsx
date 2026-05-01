'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCommand } from '@/components/command/CommandContext';
import { CheckCircle, UserPlus, Trash2, ArrowLeft, Loader2, AlertCircle, Calendar, Shield, Clock, Github, MessageSquare, History, CheckCircle2 } from 'lucide-react';
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
import { useToast } from '@/lib/hooks/use-toast';
import type { CommandAction, TaskStatus, Task, TaskEvent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/components/ui/user-avatar';
import { STATUS_CONFIG, getPriorityVariant } from '@/lib/constants/status';
import { StatusUpdateDialog } from '@/components/tasks/StatusUpdateDialog';

const VALID_STATUSES: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE'];

const STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  READY_FOR_REVIEW: 'Ready for Review',
  DONE: 'Done',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  OPEN: 'bg-gray-500/10 text-gray-500',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500',
  READY_FOR_REVIEW: 'bg-yellow-500/10 text-yellow-500',
  DONE: 'bg-green-500/10 text-green-500',
};

type TaskDetailClientProps = {
  initialTask: Task;
  users: Array<{ id: string; email: string }>;
};

export function TaskDetailClient({ initialTask, users }: TaskDetailClientProps) {
  const router = useRouter();
  const { registerAction, unregisterAction } = useCommand();
  const { success, error } = useToast();

  const [task, setTask] = useState<Task | null>(initialTask);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [statusDialogData, setStatusDialogData] = useState<{
    isOpen: boolean;
    taskId: string;
    targetStatus: string;
    requiredFields: any[];
  }>({
    isOpen: false,
    taskId: '',
    targetStatus: '',
    requiredFields: [],
  });

  useEffect(() => {
    const pageTitle = task?.title ? `${task.title} | TaskFlow` : 'Task Details | TaskFlow';
    document.title = pageTitle;
  }, [task?.title]);

  const updateStatus = useCallback(async (newStatus: TaskStatus) => {
    if (!task) return;
    setActionLoading('status');

    try {
      const response = await fetch('/api/tasks/set-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.details?.requiredFields) {
          setStatusDialogData({
            isOpen: true,
            taskId: task.id,
            targetStatus: newStatus,
            requiredFields: data.details.requiredFields,
          });
          return;
        }
        throw new Error(data.error || 'Failed to update status');
      }

      setTask({ ...task, status: newStatus });
      success(`Status updated to ${STATUS_LABELS[newStatus]}`);

      const refreshRes = await fetch(`/api/tasks/${task.id}`);
      if (refreshRes.ok) {
        const freshData = await refreshRes.json();
        setTask(freshData);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      error(err instanceof Error ? err.message : 'Failed to update status', 'Status Update Failed');
    } finally {
      setActionLoading(null);
    }
  }, [task, success, error]);

  const assignTask = useCallback(async (userId: string) => {
    if (!task) return;
    setActionLoading('assign');

    try {
      const response = await fetch('/api/tasks/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, assignedTo: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign task');
      }

      setTask({ ...task, assignedTo: userId });
      success('Task assigned successfully');
    } catch (err) {
      console.error('Error assigning task:', err);
      error(err instanceof Error ? err.message : 'Failed to assign task', 'Assignment Failed');
    } finally {
      setActionLoading(null);
    }
  }, [task, success, error]);

  const deleteTask = useCallback(async () => {
    if (!task) return;
    setActionLoading('delete');

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
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
  }, [task, router, success, error]);

  const handleBack = useCallback(() => {
    const referrer = sessionStorage.getItem('taskReferrer');
    if (referrer) {
      sessionStorage.removeItem('taskReferrer');
      router.push(referrer);
      return;
    }

    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  }, [router]);

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
          setSelectedUserId(task.assignedTo || '');
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

    actions.forEach((action) => registerAction(action));
    return () => {
      actions.forEach((action) => unregisterAction(action.id));
    };
  }, [task, registerAction, unregisterAction]);

  const handleStatusChange = useCallback(() => {
    if (pendingStatus && pendingStatus !== task?.status) {
      updateStatus(pendingStatus);
    }
    setStatusDialogOpen(false);
  }, [pendingStatus, task, updateStatus]);

  const handleAssignChange = useCallback(async () => {
    if (selectedUserId && selectedUserId !== task?.assignedTo) {
      await assignTask(selectedUserId);
    }
    setAssignDialogOpen(false);
  }, [selectedUserId, task, assignTask]);

  const handleDeleteConfirm = useCallback(() => {
    deleteTask();
    setDeleteDialogOpen(false);
  }, [deleteTask]);

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Task unavailable.</div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[task.status as TaskStatus] || STATUS_CONFIG.OPEN;
  const StatusIcon = statusInfo.icon;
  const hasCustomFields = task.customFields && Object.keys(task.customFields).length > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-muted">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border shadow-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Task Detail
                    </span>
                    <span>•</span>
                    <span>ID: {task.id.slice(0, 8)}</span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight break-words">{task.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getPriorityVariant(task.priority)} className="h-7 px-3 capitalize">
                    {task.priority.toLowerCase()}
                  </Badge>
                  <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setStatusDialogOpen(true)}
                  >
                    <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                    <span className="text-sm font-medium">{STATUS_LABELS[task.status as TaskStatus]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Description
                  </h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {task.description || (
                      <span className="italic opacity-60 text-sm">No description provided for this task.</span>
                    )}
                  </div>
                </section>

                <Separator />

                {hasCustomFields && (
                  <section>
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Handoff Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 rounded-lg p-5 border border-dashed">
                      {Object.entries(task.customFields!).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm font-medium break-words">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value || '—')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <History className="h-4 w-4 text-muted-foreground" />
                    Activity History
                  </h3>
                  <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                    {task.events?.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic pl-8">No activity recorded yet.</p>
                    ) : (
                      task.events?.map((event) => (
                        <div key={event.id} className="relative pl-10">
                          <div className="absolute left-0 top-1 w-[34px] h-[34px] rounded-full bg-background border-2 border-muted flex items-center justify-center z-10 shadow-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm text-foreground break-words flex flex-wrap gap-1">
                              <span className="font-semibold truncate max-w-[200px]">{event.changedBy?.email}</span>
                              {' '}
                              <span className="text-muted-foreground">
                                {event.eventType === 'STATUS_CHANGED' && (
                                  <>changed status to <span className="font-medium text-foreground">{event.newStatus?.replace(/_/g, ' ')}</span></>
                                )}
                                {event.eventType === 'CREATED' && 'created this task'}
                                {event.eventType === 'ASSIGNED' && 'reassigned this task'}
                                {event.eventType === 'PRIORITY_CHANGED' && 'updated the priority'}
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(event.createdAt).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-muted/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  Stakeholders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assignee</p>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setAssignDialogOpen(true)}>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {task.assignedToUser ? getInitials(task.assignedToUser.email) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate flex-1 min-w-0">
                        {task.assignedToUser?.email || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Creator</p>
                    <div className="flex items-center gap-2 p-2 opacity-80">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                          {getInitials(task.createdBy?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate flex-1 min-w-0">
                        {task.createdBy?.email}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-muted/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date set'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
            </Card>

            {task.githubIssueUrl && (
              <Card className="border-none shadow-sm bg-muted/10 overflow-hidden">
                <div className="bg-foreground/[0.03] p-3 border-b flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-2">
                    <Github className="h-3.5 w-3.5" />
                    GitHub Sync
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase bg-background">Active</Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <a
                    href={task.githubIssueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-primary transition-colors block underline-offset-4 hover:underline"
                  >
                    Issue #{task.githubIssueNumber} in {task.githubRepo}
                  </a>
                  {task.githubPrUrl && (
                    <a
                      href={task.githubPrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1.5"
                    >
                      <Shield className="h-3 w-3" />
                      View Linked Pull Request
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="pt-4 space-y-3">
              <Button
                variant="destructive"
                className="w-full justify-start text-xs h-9 bg-destructive/10 hover:bg-destructive/20 text-destructive border-none shadow-none"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <StatusUpdateDialog
        isOpen={statusDialogData.isOpen}
        onOpenChange={(open) => setStatusDialogData(prev => ({ ...prev, isOpen: open }))}
        taskId={statusDialogData.taskId}
        targetStatus={statusDialogData.targetStatus}
        requiredFields={statusDialogData.requiredFields}
        onSuccess={() => {
          success('Task updated with required information');
          fetch(`/api/tasks/${task.id}`).then(res => res.json()).then(setTask);
        }}
      />

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Task Status</DialogTitle>
            <DialogDescription>
              Select a new status for &ldquo;{task?.title}&rdquo;. Current status is {STATUS_LABELS[task.status as TaskStatus]}.
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
              disabled={!selectedUserId || selectedUserId === task?.assignedTo || actionLoading === 'assign'}
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
