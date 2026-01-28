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
import { Header } from '@/components/layout/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

  // Convert Date objects to strings for type compatibility
  const serializedTasks = tasks.map((task) => ({
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));

  // Fetch all users for bulk reassign functionality
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
    orderBy: { email: 'asc' },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header
        userEmail={user.email ?? 'Unknown'}
        title="Dashboard"
        description="Manage your tasks and track progress"
        actions={<NewTaskButton />}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              View and manage all your tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskTable initialTasks={serializedTasks} users={users} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
