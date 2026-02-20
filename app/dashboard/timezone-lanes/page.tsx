import { Suspense } from 'react';
import { getAuthUser } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { TimezoneBoard } from '@/components/lanes/TimezoneBoard';
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
    return null;
  }

  const { users, tasks } = await getTeamData();

  return (
    <FadeIn>
      <div className="h-full flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">Timezone Lanes</h1>
          <p className="text-sm text-muted-foreground">
            Drag tasks between lanes to reassign work
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<TimezoneLanesSkeletonGrid count={3} />}>
            <TimezoneBoard users={users} tasks={tasks} />
          </Suspense>
        </div>
      </div>
    </FadeIn>
  );
}
