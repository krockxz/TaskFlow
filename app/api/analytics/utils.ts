/**
 * Analytics Utilities
 *
 * Shared utilities for analytics API routes.
 */

/**
 * Date range filter options.
 */
export type DateRangePreset = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all_time';

/**
 * Creates a Prisma-compatible date filter for the given preset.
 *
 * @param preset - The date range preset to use
 * @returns A Prisma date filter object or undefined for 'all_time'
 */
export const getDateRangeFilter = (
  preset: DateRangePreset
): { gte: Date } | undefined => {
  if (preset === 'all_time') {
    return undefined;
  }

  const now = new Date();
  const days =
    preset === 'last_7_days' ? 7 : preset === 'last_30_days' ? 30 : 90;

  return {
    gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
  };
};

/**
 * Validates if a string is a valid DateRangePreset.
 */
export const isValidDateRange = (value: string): value is DateRangePreset => {
  return ['last_7_days', 'last_30_days', 'last_90_days', 'all_time'].includes(value);
};
