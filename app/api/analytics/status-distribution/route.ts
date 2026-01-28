/**
 * Status Distribution Analytics API Route
 *
 * Returns task counts grouped by status for the current user's accessible tasks.
 */

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getDateRangeFilter, type DateRangePreset, isValidDateRange } from '../utils';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rangeParam = searchParams.get('range');
  const range: DateRangePreset = (rangeParam && isValidDateRange(rangeParam)) ? rangeParam : 'last_30_days';
  const dateFilter = getDateRangeFilter(range);

  const statusDistribution = await prisma.task.groupBy({
    by: ['status'],
    where: {
      OR: [
        { assignedTo: user.id },
        { createdById: user.id },
      ],
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    _count: { id: true },
  });

  return NextResponse.json(
    statusDistribution.map((s) => ({
      status: s.status,
      count: s._count.id,
    }))
  );
}
