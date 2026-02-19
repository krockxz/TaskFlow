/**
 * Tasks Per User Analytics API Route
 *
 * Returns task counts grouped by assignee for the current user's accessible tasks.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getDateRangeFilter, type DateRangePreset, isValidDateRange } from '../utils';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(req: Request) {
  const user = await requireAuth();

  const { searchParams } = new URL(req.url);
  const rangeParam = searchParams.get('range');
  const range: DateRangePreset = (rangeParam && isValidDateRange(rangeParam)) ? rangeParam : 'last_30_days';
  const dateFilter = getDateRangeFilter(range);

  // Get tasks grouped by assignee (only user's accessible tasks)
  const tasksPerUser = await prisma.task.groupBy({
    by: ['assignedTo'],
    where: {
      assignedTo: { not: null },
      OR: [
        { assignedTo: user.id },
        { createdById: user.id },
      ],
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    _count: { id: true },
  });

  // Get user emails for all assignees
  const userIds = tasksPerUser
    .map((t) => t.assignedTo)
    .filter((id): id is string => id !== null);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

  // Format response with email and count, sorted by count descending
  const data = tasksPerUser
    .filter((t) => t.assignedTo)
    .map((t) => ({
      email: userMap[t.assignedTo!] || 'Unknown',
      count: t._count.id,
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(data);
}
