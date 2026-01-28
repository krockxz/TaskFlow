/**
 * Dashboard Page
 *
 * Main dashboard showing user's tasks.
 * Server Component that fetches initial data with filter support.
 */

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { TaskTable } from './components/TaskTable';
import { NewTaskButton } from './components/NewTaskButton';
import TaskFilters from './components/TaskFilters';
import FilterChips from './components/FilterChips';
import { Header } from '@/components/layout/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TaskStatus, TaskPriority, DateRangePreset } from '@/lib/types';

interface DashboardPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assignedTo?: string;
    dateRange?: string;
    search?: string;
  }>;
}

/**
 * Calculates the date filter object based on a preset range.
 */
const getDateRangeFilter = (preset: DateRangePreset) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return { gte: startOfDay };
    case 'last_7_days':
      return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    case 'last_30_days':
      return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    case 'last_90_days':
      return { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
    case 'all_time':
    default:
      return undefined;
  }
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  // Await searchParams for Next.js 15+
  const params = await searchParams;

  // Parse filters from searchParams
  const statusFilter = params.status?.split(',').filter(Boolean) as TaskStatus[] | undefined;
  const priorityFilter = params.priority?.split(',').filter(Boolean) as TaskPriority[] | undefined;
  const assignedTo = params.assignedTo;
  const dateRange = params.dateRange as DateRangePreset | undefined;
  const search = params.search;

  // Build where clause with filters
  const where: Record<string, unknown> = {
    OR: [
      { assignedTo: user.id },
      { createdById: user.id },
    ],
  };

  // Apply status filter (multi-select)
  if (statusFilter && statusFilter.length > 0) {
    where.status = { in: statusFilter };
  }

  // Apply priority filter (multi-select)
  if (priorityFilter && priorityFilter.length > 0) {
    where.priority = { in: priorityFilter };
  }

  // Apply assignedTo filter
  if (assignedTo) {
    where.assignedTo = assignedTo;
  }

  // Apply search filter (case-insensitive title search)
  if (search) {
    where.title = { contains: search, mode: 'insensitive' as const };
  }

  // Apply date range filter
  if (dateRange && dateRange !== 'all_time') {
    const dateFilter = getDateRangeFilter(dateRange);
    if (dateFilter) {
      where.createdAt = dateFilter;
    }
  }

  // Fetch user's tasks (created by or assigned to) with filters applied
  const tasks = await prisma.task.findMany({
    where,
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

  // Fetch all users for filter dropdown and bulk reassign functionality
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  View and manage all your tasks
                </CardDescription>
              </div>
              <TaskFilters users={users} />
            </div>
          </CardHeader>
          <CardContent>
            <FilterChips users={users} />
            <TaskTable initialTasks={serializedTasks} users={users} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
