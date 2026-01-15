/**
 * Dashboard Page
 *
 * Main dashboard showing user's tasks.
 * Server Component that fetches initial data.
 */

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { TaskTable } from './components/TaskTable';
import { NewTaskButton } from './components/NewTaskButton';

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's tasks (created by or assigned to)
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assignedTo: user.id },
        { createdById: user.id },
      ],
    },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <NewTaskButton />
              <span className="text-sm text-gray-600">{user.email}</span>
              <a
                href="/api/auth/logout"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card">
          <TaskTable initialTasks={tasks} />
        </div>
      </main>
    </div>
  );
}
