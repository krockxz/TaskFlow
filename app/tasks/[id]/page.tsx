'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCommand } from '@/components/command/CommandContext';
import { CheckCircle, UserPlus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
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
  const taskId = params.id as string;

  // Fetch task data
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        router.push('/dashboard');
        return;
      }

      setTask(data);
      setLoading(false);
    }

    loadTask();
  }, [taskId, router]);

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
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      setTask({ ...task, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  }, [task, taskId]);

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
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign task');
      }

      setTask({ ...task, assigned_to: userId });
    } catch (error) {
      console.error('Error assigning task:', error);
      alert(error instanceof Error ? error.message : 'Failed to assign task');
    } finally {
      setActionLoading(null);
    }
  }, [task, taskId]);

  // Delete task via API
  const deleteTask = useCallback(async () => {
    if (!task) return;
    setActionLoading('delete');

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete task');
      setActionLoading(null);
    }
  }, [task, taskId, router]);

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
          const currentLabel = STATUS_LABELS[task.status as TaskStatus] || task.status;
          const options = VALID_STATUSES.map(s => `${s} - ${STATUS_LABELS[s]}`).join('\n');
          const input = prompt(
            `Current status: ${currentLabel}\n\nEnter new status:\n${options}`,
            task.status
          );
          if (input) {
            const upperStatus = input.toUpperCase() as TaskStatus;
            if (VALID_STATUSES.includes(upperStatus)) {
              updateStatus(upperStatus);
            } else {
              alert(`Invalid status. Valid options: ${VALID_STATUSES.join(', ')}`);
            }
          }
        },
      },
      {
        id: `task-${task.id}-assign`,
        label: 'Assign Task',
        icon: UserPlus,
        context: 'task',
        keywords: ['assign', 'user', 'owner'],
        onSelect: () => {
          const userId = prompt('Enter user ID to assign:');
          if (userId) {
            assignTask(userId);
          }
        },
      },
      {
        id: `task-${task.id}-delete`,
        label: 'Delete Task',
        icon: Trash2,
        context: 'task',
        keywords: ['delete', 'remove'],
        onSelect: () => {
          if (confirm('Are you sure you want to delete this task?')) {
            deleteTask();
          }
        },
      },
    ];

    // Register all actions
    actions.forEach(action => registerAction(action));

    // Cleanup on unmount
    return () => {
      actions.forEach(action => unregisterAction(action.id));
    };
  }, [task, registerAction, unregisterAction, updateStatus, assignTask, deleteTask]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Task not found</div>
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
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
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
              Press ⌘K to open command palette for task actions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
