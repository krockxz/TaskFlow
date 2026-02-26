'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ReactNode } from 'react';
import { PIE_CHART, TOOLTIP_STYLE } from '@/lib/constants/charts';

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

interface BasePieChartProps {
  /** Title displayed in the card header */
  title: string;
  /** Data to display in the chart */
  data: ChartDataPoint[];
  /** Optional content to show when data is empty */
  emptyContent?: ReactNode;
  /** Height of the chart container */
  height?: number;
  /** Outer radius of the pie */
  outerRadius?: number;
}

/**
 * Reusable pie chart component with consistent styling.
 * Handles empty state and provides a standard layout.
 *
 * @example
 * ```tsx
 * const data = [
 *   { name: 'Open', value: 10, color: 'hsl(var(--chart-1))' },
 *   { name: 'Done', value: 5, color: 'hsl(var(--chart-2))' },
 * ];
 *
 * <BasePieChart title="Status Distribution" data={data} />
 * ```
 */
export function BasePieChart({
  title,
  data,
  emptyContent,
  height = 300,
  outerRadius = PIE_CHART.OUTER_RADIUS,
}: BasePieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {emptyContent ?? <p className="text-sm text-muted-foreground">No data available</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              outerRadius={outerRadius}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
