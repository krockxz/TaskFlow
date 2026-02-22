/**
 * Date Range Utilities
 *
 * Shared utilities for date range filtering across the application.
 * Provides a consistent way to convert date range presets into Prisma-compatible filters.
 */

import type { DateRangePreset } from '@/lib/types';

/**
 * Creates a Prisma-compatible date filter for the given preset.
 *
 * @param preset - The date range preset to use
 * @returns A Prisma date filter object or undefined for 'all_time'
 */
export const getDateRangeFilter = (
  preset: DateRangePreset
): { gte: Date } | undefined => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return { gte: startOfDay };
    case 'last_7_days':
      return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    case 'last_30_days':
      return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    case 'last_90_days':
      return { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
    case 'all_time':
    default:
      return undefined;
  }
};

/**
 * Validates if a string is a valid DateRangePreset.
 *
 * @param value - The string to validate
 * @returns True if the value is a valid DateRangePreset
 */
export const isValidDateRange = (value: string): value is DateRangePreset => {
  return ['today', 'last_7_days', 'last_30_days', 'last_90_days', 'all_time'].includes(value);
};
