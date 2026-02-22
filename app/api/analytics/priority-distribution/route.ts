/**
 * Priority Distribution Analytics API Route
 *
 * Returns task counts grouped by priority for the current user's accessible tasks.
 */

import { NextResponse } from 'next/server';
import { getDateRangeFilter, type DateRangePreset, isValidDateRange } from '../utils';
import { requireAuth } from '@/lib/middleware/auth';
import { getAnalyticsGroupBy } from '../utils/handler';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get('range');
    const range: DateRangePreset = (rangeParam && isValidDateRange(rangeParam)) ? rangeParam : 'last_30_days';
    const dateFilter = getDateRangeFilter(range);

    const results = await getAnalyticsGroupBy(user, 'priority', dateFilter);

    return NextResponse.json(
      results.map((r) => ({
        priority: r.value,
        count: r.count,
      }))
    );
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('GET /api/analytics/priority-distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
