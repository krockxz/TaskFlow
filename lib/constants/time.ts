/**
 * Time-related constants for the application.
 * Centralizes cache durations and time intervals to eliminate magic numbers.
 */

/**
 * Cache duration constants in milliseconds.
 * Used for TanStack Query cache configuration and other caching scenarios.
 */
export const CACHE_DURATION = {
  /** 30 minutes - Standard cache duration for most data */
  THIRTY_MINUTES: 30 * 60 * 1000,
  /** 5 minutes - Medium-term cache for rarely-changing data */
  FIVE_MINUTES: 5 * 60 * 1000,
  /** 30 seconds - Short-term cache for frequently-changing data */
  THIRTY_SECONDS: 30 * 1000,
  /** 5 seconds - Very short-term cache for real-time data */
  FIVE_SECONDS: 5000,
} as const;

/**
 * Time intervals in milliseconds.
 * Used for date range calculations and time-based queries.
 */
export const TIME_MS = {
  /** 24 hours in milliseconds */
  DAY: 24 * 60 * 60 * 1000,
  /** 7 days in milliseconds */
  WEEK: 7 * 24 * 60 * 60 * 1000,
  /** 30 days in milliseconds */
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;
