/**
 * Tasks Query API Route
 *
 * Returns tasks for the current authenticated user.
 * Used by TanStack Query for client-side data fetching.
 */

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assignedTo: user.id },
        { createdById: user.id },
      ],
    },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(tasks);
}
