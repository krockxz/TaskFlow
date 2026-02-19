'use client';

import { BasePieChart, type ChartDataPoint } from './BasePieChart';
import type { TaskPriority } from '@/lib/types';
import { PRIORITY_LABELS } from '@/lib/constants/filters';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  HIGH: 'hsl(var(--destructive))',
  MEDIUM: 'hsl(var(--primary))',
  LOW: 'hsl(var(--muted))',
};

interface PriorityDistributionChartProps {
  data: { priority: TaskPriority; count: number }[];
}

export function PriorityDistributionChart({ data }: PriorityDistributionChartProps) {
  const chartData: ChartDataPoint[] = data.map((item) => ({
    name: PRIORITY_LABELS[item.priority],
    value: item.count,
    color: PRIORITY_COLORS[item.priority],
  }));

  return <BasePieChart title="Priority Distribution" data={chartData} />;
}
