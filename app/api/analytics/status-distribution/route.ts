/**
 * Status Distribution Analytics API Route
 *
 * Returns task counts grouped by status for the current user's accessible tasks.
 */

import { NextResponse } from 'next/server';
import { getDateRangeFilter, type DateRangePreset, isValidDateRange } from '../utils';
import { requireAuth } from '@/lib/middleware/auth';
import { getAnalyticsGroupBy } from '../utils/handler';

export async function GET(req: Request) {
  const user = await requireAuth();

  const { searchParams } = new URL(req.url);
  const rangeParam = searchParams.get('range');
  const range: DateRangePreset = (rangeParam && isValidDateRange(rangeParam)) ? rangeParam : 'last_30_days';
  const dateFilter = getDateRangeFilter(range);

  const results = await getAnalyticsGroupBy(user, 'status', dateFilter);

  return NextResponse.json(
    results.map((r) => ({
      status: r.value,
      count: r.count,
    }))
  );
}
