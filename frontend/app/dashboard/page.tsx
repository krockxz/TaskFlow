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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage your tasks and track progress
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NewTaskButton />
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <a href="/api/auth/logout">Sign out</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              View and manage all your tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskTable initialTasks={serializedTasks} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
