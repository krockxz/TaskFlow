/**
 * Analytics Handler Utilities
 *
 * Generic handler for analytics groupBy queries.
 * Eliminates duplicate code across analytics routes.
 */

import prisma from '@/lib/prisma';
import type { User } from '@supabase/supabase-js';
import type { TaskStatus, TaskPriority } from '@/lib/types';

/**
 * Group by options for analytics queries.
 */
type GroupByField = 'status' | 'priority' | 'assignedTo';

/**
 * Date filter for analytics queries.
 */
interface DateFilter {
  gte: Date;
}

/**
 * Result of a groupBy analytics query.
 */
interface AnalyticsResult {
  field: GroupByField;
  value: string;
  count: number;
}

/**
 * Generic analytics groupBy query handler.
 *
 * @param user - Authenticated user
 * @param groupBy - Field to group by
 * @param dateFilter - Optional date range filter
 * @returns Grouped task counts
 */
export async function getAnalyticsGroupBy(
  user: User,
  groupBy: GroupByField,
  dateFilter?: DateFilter
): Promise<AnalyticsResult[]> {
  const baseWhere = {
    OR: [
      { assignedTo: user.id },
      { createdById: user.id },
    ],
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };

  // For assignedTo grouping, filter out null values
  const where = groupBy === 'assignedTo'
    ? { ...baseWhere, assignedTo: { not: null } as unknown as null }
    : baseWhere;

  const results = await prisma.task.groupBy({
    by: [groupBy],
    where,
    _count: { id: true },
  });

  return results.map((r) => ({
    field: groupBy,
    value: r[groupBy] as string,
    count: r._count.id,
  }));
}

/**
 * Fetches user emails for assignee analytics.
 *
 * @param userIds - Array of user IDs
 * @returns Map of user ID to email
 */
export async function getUserEmails(userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });

  return Object.fromEntries(users.map((u) => [u.id, u.email]));
}
