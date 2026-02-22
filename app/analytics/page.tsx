/**
 * Analytics Dashboard Page
 *
 * Displays team-focused metrics with interactive charts.
 * Server Component that fetches initial data.
 */

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector';
import { TasksPerUserChart } from '@/components/analytics/TasksPerUserChart';
import { StatusDistributionChart } from '@/components/analytics/StatusDistributionChart';
import { PriorityDistributionChart } from '@/components/analytics/PriorityDistributionChart';
import { WorkloadBalanceChart } from '@/components/analytics/WorkloadBalanceChart';
import type { TaskStatus, TaskPriority } from '@/lib/types';

interface AnalyticsPageProps {
  searchParams: Promise<{
    range?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all_time';
  }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const range = params.range || 'last_30_days';

  // Get date filter
  const now = new Date();
  const days = range === 'last_7_days' ? 7 : range === 'last_30_days' ? 30 : range === 'last_90_days' ? 90 : undefined;
  const dateFilter = days
    ? { gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000) }
    : undefined;

  // Fetch analytics data
  const whereClause = {
    OR: [
      { assignedTo: user.id },
      { createdById: user.id },
    ],
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };

  // Run all independent queries in parallel
  const [
    assignedTasks,
    statusDistribution,
    priorityDistribution,
    createdTasks,
  ] = await Promise.all([
    // Tasks per assignee (also used for tasksPerUser chart)
    prisma.task.groupBy({
      by: ['assignedTo'],
      where: {
        ...whereClause,
        assignedTo: { not: null },
      },
      _count: { id: true },
    }),
    // Status distribution
    prisma.task.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { id: true },
    }),
    // Priority distribution
    prisma.task.groupBy({
      by: ['priority'],
      where: whereClause,
      _count: { id: true },
    }),
    // Tasks per creator
    prisma.task.groupBy({
      by: ['createdById'],
      where: whereClause,
      _count: { id: true },
    }),
  ]);

  // Collect all unique user IDs (assignees + creators)
  const allUserIds = new Set([
    ...assignedTasks.map(t => t.assignedTo!).filter(Boolean),
    ...createdTasks.map(t => t.createdById),
  ]);

  // Single user fetch for all users (consolidated duplicate fetches)
  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(allUserIds) } },
    select: { id: true, email: true },
  });

  const userMap = Object.fromEntries(users.map(u => [u.id, u.email]));

  // Tasks per user data
  const tasksPerUserData = assignedTasks
    .filter(t => t.assignedTo)
    .map(t => ({
      email: userMap[t.assignedTo!] || 'Unknown',
      count: t._count.id,
    }))
    .sort((a, b) => b.count - a.count);

  // Status distribution data
  const statusData = statusDistribution.map(s => ({
    status: s.status as TaskStatus,
    count: s._count.id,
  }));

  // Priority distribution data
  const priorityData = priorityDistribution.map(p => ({
    priority: p.priority as TaskPriority,
    count: p._count.id,
  }));

  // Workload balance data
  const assignedMap = Object.fromEntries(
    assignedTasks.filter(t => t.assignedTo).map(t => [t.assignedTo!, t._count.id])
  );
  const createdMap = Object.fromEntries(
    createdTasks.map(t => [t.createdById, t._count.id])
  );

  const workloadData = users.map(u => ({
    email: userMap[u.id] || 'Unknown',
    assigned: assignedMap[u.id] || 0,
    created: createdMap[u.id] || 0,
  })).sort((a, b) => (b.assigned + b.created) - (a.assigned + a.created));

  return (
    <div className="min-h-screen bg-background">
      <Header
        userEmail={user.email ?? 'Unknown'}
        title="Analytics"
        description="Track team productivity and task distribution"
        actions={<TimeRangeSelector defaultValue={range} />}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <TasksPerUserChart data={tasksPerUserData} />
          <StatusDistributionChart data={statusData} />
          <PriorityDistributionChart data={priorityData} />
          <WorkloadBalanceChart data={workloadData} />
        </div>
      </main>
    </div>
  );
}
