/**
 * Task Detail Page
 *
 * Shows full task details with event history.
 */

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { TaskDetail } from './components/TaskDetail';
import { notFound } from 'next/navigation';

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  // Fetch task with full details
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
      events: {
        include: { changedBy: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Check if user has access to this task
  if (!task || (task.createdById !== user.id && task.assignedTo !== user.id)) {
    notFound();
  }

  // Convert Date objects to strings for type compatibility
  const serializedTask = {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    events: task.events.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </a>
            <h1 className="text-xl font-semibold text-gray-900">Task Details</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <TaskDetail task={serializedTask} currentUserId={user.id} />
      </main>
    </div>
  );
}
