/**
 * New Task Page
 *
 * Server Component for creating new tasks.
 */

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { TaskForm } from './components/TaskForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">New Task</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a Task</CardTitle>
            <CardDescription>
              Fill in the details below to create a new task.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskForm users={users} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
