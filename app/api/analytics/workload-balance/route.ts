/**
 * Workload Balance Analytics API Route
 *
 * Returns comparison of assigned vs created tasks per user
 * for the current user's accessible tasks.
 */

import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getDateRangeFilter, type DateRangePreset, isValidDateRange } from '../utils';
import { unauthorized, serverError, handleApiError } from '@/lib/api/errors';

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get('range');
    const range: DateRangePreset = (rangeParam && isValidDateRange(rangeParam)) ? rangeParam : 'last_30_days';
    const dateFilter = getDateRangeFilter(range);

    // Get assigned tasks count grouped by assignee
    const assignedTasks = await prisma.task.groupBy({
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

    // Get created tasks count grouped by creator
    const createdTasks = await prisma.task.groupBy({
      by: ['createdById'],
      where: {
        OR: [
          { assignedTo: user.id },
          { createdById: user.id },
        ],
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _count: { id: true },
    });

    // Collect all unique user IDs from both result sets
    const userIds = new Set([
      ...assignedTasks.map((t) => t.assignedTo).filter((id): id is string => id !== null),
      ...createdTasks.map((t) => t.createdById),
    ]);

    // Fetch user details for all relevant users
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, email: true },
    });

    // Create lookup maps
    const assignedMap = Object.fromEntries(
      assignedTasks
        .filter((t) => t.assignedTo)
        .map((t) => [t.assignedTo!, t._count.id])
    );
    const createdMap = Object.fromEntries(
      createdTasks.map((t) => [t.createdById, t._count.id])
    );
    const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

    // Combine data and sort by total workload (assigned + created)
    const data = users
      .map((u) => ({
        email: userMap[u.id] || 'Unknown',
        assigned: assignedMap[u.id] || 0,
        created: createdMap[u.id] || 0,
      }))
      .sort((a, b) => b.assigned + b.created - (a.assigned + a.created));

    return NextResponse.json(data);
  } catch (error) {
    const handled = handleApiError(error, 'GET /api/analytics/workload-balance');
    if (handled) return handled;

    return serverError('Failed to fetch workload balance data');
  }
}
