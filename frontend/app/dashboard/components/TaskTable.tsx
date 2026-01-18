/**
 * TaskTable Component
 *
 * Client Component with TanStack Query for data fetching and caching.
 * Includes optimistic updates and realtime subscriptions.
 */

'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/lib/types';

const statusColors: Record<string, string> = {
  OPEN: 'badge-open',
  IN_PROGRESS: 'badge-in-progress',
  READY_FOR_REVIEW: 'badge-ready-for-review',
  DONE: 'badge-done',
};

const priorityColors: Record<string, string> = {
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
};

interface TaskTableProps {
  initialTasks: Task[];
}

export function TaskTable({ initialTasks }: TaskTableProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Fetch tasks with TanStack Query
  const { data: tasks = initialTasks } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/queries/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    initialData: initialTasks,
    staleTime: 5000,
  });

  // Mutation for status updates
  const { mutate } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      }).then((res) => res.json()),

    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map((t) =>
          t.id === variables.taskId
            ? { ...t, status: variables.status.toUpperCase() as Task['status'] }
            : t
        )
      );

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },

    // Always refetch after settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Realtime subscription - FETCH-ON-EVENT PATTERN
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, () => {
        // Signal TanStack Query to refetch
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No tasks yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <a
                  href={`/tasks/${task.id}`}
                  className="text-sm font-medium text-sky-500 hover:text-sky-600"
                >
                  {task.title}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={task.status.toLowerCase()}
                  onChange={(e) => mutate({ taskId: task.id, status: e.target.value })}
                  className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${statusColors[task.status]}`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="ready_for_review">Ready for Review</option>
                  <option value="done">Done</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm capitalize ${priorityColors[task.priority]}`}>
                  {task.priority.toLowerCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {task.assignedToUser?.email || 'Unassigned'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(task.updatedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
