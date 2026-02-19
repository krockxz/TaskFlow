'use client';

import { BasePieChart, type ChartDataPoint } from './BasePieChart';
import type { TaskStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/constants/filters';

const STATUS_COLORS: Record<TaskStatus, string> = {
  OPEN: 'hsl(var(--secondary))',
  IN_PROGRESS: 'hsl(var(--chart-3))',
  READY_FOR_REVIEW: 'hsl(var(--chart-4))',
  DONE: 'hsl(var(--chart-1))',
};

interface StatusDistributionChartProps {
  data: { status: TaskStatus; count: number }[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData: ChartDataPoint[] = data.map((item) => ({
    name: STATUS_LABELS[item.status],
    value: item.count,
    color: STATUS_COLORS[item.status],
  }));

  return <BasePieChart title="Status Distribution" data={chartData} />;
}
