/**
 * TaskForm Component
 *
 * Client Component for creating/editing tasks with form validation.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

interface TaskFormProps {
  users: Pick<User, 'id' | 'email'>[];
}

export function TaskForm({ users }: TaskFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description') || undefined,
          assignedTo: formData.get('assignedTo') || undefined,
          priority: formData.get('priority') || 'MEDIUM',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={255}
          className="input"
          placeholder="What needs to be done?"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={5000}
          rows={4}
          className="input"
          placeholder="Add more details..."
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
          Assign To
        </label>
        <select
          id="assignedTo"
          name="assignedTo"
          className="input"
          disabled={isLoading}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          defaultValue="MEDIUM"
          className="input"
          disabled={isLoading}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Creating...' : 'Create Task'}
        </button>
        <a
          href="/dashboard"
          className="btn btn-secondary"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
