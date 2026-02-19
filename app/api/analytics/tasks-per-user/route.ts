/**
 * Tasks Per User Analytics API Route
 *
 * Returns task counts grouped by assignee for the current user's accessible tasks.
 */

import { NextResponse } from 'next/server';
import { getDateRangeFilter, type DateRangePreset, isValidDateRange } from '../utils';
import { requireAuth } from '@/lib/middleware/auth';
import { getAnalyticsGroupBy, getUserEmails } from '../utils/handler';

export async function GET(req: Request) {
  const user = await requireAuth();

  const { searchParams } = new URL(req.url);
  const rangeParam = searchParams.get('range');
  const range: DateRangePreset = (rangeParam && isValidDateRange(rangeParam)) ? rangeParam : 'last_30_days';
  const dateFilter = getDateRangeFilter(range);

  const results = await getAnalyticsGroupBy(user, 'assignedTo', dateFilter);

  // Get user emails for all assignees
  const userIds = results
    .map((r) => r.value)
    .filter((id): id is string => id !== null);

  const userEmailMap = await getUserEmails(userIds);

  // Format response with email and count, sorted by count descending
  const data = results
    .filter((r) => r.value)
    .map((r) => ({
      email: userEmailMap[r.value] || 'Unknown',
      count: r.count,
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(data);
}
