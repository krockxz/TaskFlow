/**
 * New Task Page
 *
 * Server Component for creating new tasks.
 */

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { TaskForm } from './components/TaskForm';

export default async function NewTaskPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all users for assignment dropdown
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
    orderBy: { email: 'asc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </a>
              <h1 className="text-xl font-semibold text-gray-900">New Task</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card">
          <TaskForm users={users} />
        </div>
      </main>
    </div>
  );
}
