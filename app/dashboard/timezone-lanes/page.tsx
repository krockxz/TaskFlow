import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { TimezoneLanesContent } from './TimezoneLanesContent';
import { FadeIn } from '@/components/animations/fade-in';
import { TimezoneLanesSkeletonGrid } from '@/components/skeletons/timezone-lane-skeleton';

async function getTeamData() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      timezone: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { email: 'asc' },
  });

  const tasks = await prisma.task.findMany({
    where: {
      status: { not: 'DONE' },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { users, tasks };
}

export default async function TimezoneLanesPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const { users, tasks } = await getTeamData();

  return (
    <FadeIn>
      <DashboardSidebar users={users} userEmail={user.email ?? 'Unknown'}>
        <Suspense fallback={<TimezoneLanesSkeletonGrid count={3} />}>
          <TimezoneLanesContent users={users} tasks={tasks} />
        </Suspense>
      </DashboardSidebar>
    </FadeIn>
  );
}
