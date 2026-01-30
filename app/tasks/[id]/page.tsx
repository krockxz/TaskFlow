'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCommand } from '@/components/command/CommandContext';
import { CheckCircle, UserPlus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { CommandAction } from '@/lib/types';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { registerAction, unregisterAction } = useCommand();
  const taskId = params.id as string;

  // Fetch task data
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          const newStatus = prompt('Enter new status (todo, in-progress, done):', task.status);
          if (newStatus && ['todo', 'in-progress', 'done'].includes(newStatus)) {
            const supabase = createClient();
            supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
            setTask({ ...task, status: newStatus });
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
            const supabase = createClient();
            supabase.from('tasks').update({ assigned_to: userId }).eq('id', task.id);
            setTask({ ...task, assigned_to: userId });
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
            const supabase = createClient();
            supabase.from('tasks').delete().eq('id', task.id);
            router.push('/dashboard');
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
  }, [task, registerAction, unregisterAction, router]);

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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'done' ? 'bg-green-500/10 text-green-500' :
              task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
              'bg-gray-500/10 text-gray-500'
            }`}>
              {task.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{task.description || 'No description'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                <p className="text-sm capitalize">{task.priority || 'No priority'}</p>
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
