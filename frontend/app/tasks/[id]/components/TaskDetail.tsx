/**
 * TaskDetail Component
 *
 * Client Component displaying task details with event history.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/lib/types';

interface TaskDetailProps {
  task: Task;
  currentUserId: string;
}

const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  READY_FOR_REVIEW: 'Ready for Review',
  DONE: 'Done',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const eventTypeLabels: Record<string, string> = {
  CREATED: 'created this task',
  ASSIGNED: 'assigned this task',
  STATUS_CHANGED: 'changed status',
  COMPLETED: 'completed this task',
  PRIORITY_CHANGED: 'changed priority',
};

export function TaskDetail({ task, currentUserId }: TaskDetailProps) {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      }).then((res) => res.json()),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Created by {task.createdBy.email} • {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>

          <select
            value={task.status.toLowerCase()}
            onChange={(e) => mutate({ taskId: task.id, status: e.target.value.toUpperCase() })}
            className="btn btn-secondary"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="ready_for_review">Ready for Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        {task.description && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <p className="font-medium">{statusLabels[task.status]}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Priority</span>
            <p className="font-medium capitalize">{priorityLabels[task.priority]}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Assigned To</span>
            <p className="font-medium">{task.assignedToUser?.email || 'Unassigned'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Last Updated</span>
            <p className="font-medium">{new Date(task.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Event History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
        <div className="space-y-4">
          {task.events && task.events.length > 0 ? (
            task.events.map((event) => (
              <div key={event.id} className="flex gap-4 text-sm">
                <div className="flex-shrink-0 w-24 text-gray-500">
                  {new Date(event.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    {event.changedBy.email}
                  </span>{' '}
                  <span className="text-gray-700">
                    {eventTypeLabels[event.eventType]}
                  </span>
                  {event.oldStatus && event.newStatus && (
                    <span className="text-gray-600">
                      {' '}from <span className="font-medium">{statusLabels[event.oldStatus]}</span> to{' '}
                      <span className="font-medium">{statusLabels[event.newStatus]}</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
