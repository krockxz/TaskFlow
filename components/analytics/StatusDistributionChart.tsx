'use client';

import { BasePieChart, type ChartDataPoint } from './BasePieChart';
import type { TaskStatus } from '@/lib/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants/status';

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
