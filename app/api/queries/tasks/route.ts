/**
 * Tasks Query API Route
 *
 * Returns tasks for the current authenticated user.
 * Supports filtering by status, priority, assignedTo, dateRange, and search.
 * Supports pagination with take/skip parameters.
 * Used by TanStack Query for client-side data fetching.
 */

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { TaskStatus, TaskPriority, DateRangePreset } from '@/lib/types';

import type { Task } from '@/lib/types';

interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  // Parse pagination parameters
  const pageParam = searchParams.get('page');
  const pageSizeParam = searchParams.get('pageSize');

  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeParam || '20', 10)));
  const skip = (page - 1) * pageSize;

  // Parse filter parameters
  const statusParam = searchParams.get('status');
  const priorityParam = searchParams.get('priority');
  const assignedTo = searchParams.get('assignedTo') || undefined;
  const dateRange = searchParams.get('dateRange') as DateRangePreset | undefined;
  const search = searchParams.get('search') || undefined;

  // Split comma-separated values for multi-select filters
  const statusFilter = statusParam?.split(',').filter(Boolean) as TaskStatus[] | undefined;
  const priorityFilter = priorityParam?.split(',').filter(Boolean) as TaskPriority[] | undefined;

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

  // Execute queries in parallel for better performance
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { id: true, email: true } },
        assignedToUser: { select: { id: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: pageSize,
      skip,
    }),
    prisma.task.count({ where }),
  ]);

  // Convert Date objects to strings for type compatibility
  const serializedTasks = tasks.map((task) => ({
    ...task,
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));

  const response: TasksResponse = {
    tasks: serializedTasks,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };

  return NextResponse.json(response);
}
