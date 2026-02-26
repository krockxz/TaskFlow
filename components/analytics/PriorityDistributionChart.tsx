'use client';

import { BasePieChart, type ChartDataPoint } from './BasePieChart';
import type { TaskPriority } from '@/lib/types';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants/status';

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
