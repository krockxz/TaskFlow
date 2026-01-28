/**
 * Tasks Query API Route
 *
 * Returns tasks for the current authenticated user.
 * Supports filtering by status, priority, assignedTo, dateRange, and search.
 * Used by TanStack Query for client-side data fetching.
 */

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { TaskStatus, TaskPriority, DateRangePreset } from '@/lib/types';

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

  const tasks = await prisma.task.findMany({
    where,
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(tasks);
}
