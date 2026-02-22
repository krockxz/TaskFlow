/**
 * Dashboard Page
 *
 * Main dashboard showing user's tasks.
 * Server Component that fetches initial data with filter support.
 */

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardView } from './components/DashboardView';
import type { TaskStatus, TaskPriority, DateRangePreset } from '@/lib/types';
import { getDateRangeFilter } from '@/lib/utils/date-range';
import { FadeIn } from '@/components/animations/fade-in';

interface DashboardPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assignedTo?: string;
    dateRange?: string;
    search?: string;
  }>;
}

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
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));

  // Fetch all users for filter dropdown and bulk reassign functionality
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
    orderBy: { email: 'asc' },
  });

  return (
    <FadeIn>
      <DashboardSidebar users={users} userEmail={user.email ?? 'Unknown'}>
        <DashboardView
          initialTasks={serializedTasks}
          users={users}
          userEmail={user.email ?? 'Unknown'}
        />
      </DashboardSidebar>
    </FadeIn>
  );
}
