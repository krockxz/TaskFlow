/**
 * Centralized TanStack Query Configuration
 *
 * Provides consistent query settings across the application.
 * Import these configs instead of duplicating query options.
 */

import type { TaskFilters } from '@/lib/types';

/**
 * Default query options for different data types.
 * These settings optimize caching, refetching, and retry behavior.
 */
export const queryConfig = {
  /**
   * Tasks query configuration
   * - 5 second stale time for balance between freshness and performance
   * - 30 minute cache duration to reduce server load
   * - Refetch on window focus disabled to prevent unnecessary requests
   */
  tasks: {
    staleTime: 5000, // 5 seconds
    gcTime: 30 * 60 * 1000, // 30 minutes (v5 uses gcTime instead of cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  /**
   * Notifications query configuration
   * - Longer stale time since notifications update less frequently
   * - No refetch on focus to avoid distraction
   */
  notifications: {
    staleTime: 30000, // 30 seconds
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  /**
   * Users query configuration
   * - Longer stale time as user list changes infrequently
   * - Useful for assignee dropdowns and mentions
   */
  users: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  /**
   * Analytics query configuration
   * - Longer stale time for analytics data
   * - Analytics don't need to be real-time
   */
  analytics: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
} as const;

/**
 * Mutation configuration
 * Consistent mutation settings across the app
 */
export const mutationConfig = {
  retry: 1,
  throwOnError: false,
} as const;

/**
 * Helper function to get tasks query config with filters
 */
export function getTasksQueryConfig(filters?: TaskFilters) {
  return {
    ...queryConfig.tasks,
    queryKey: ['tasks', filters],
  };
}

/**
 * Helper function to get notifications query config
 */
export function getNotificationsQueryConfig() {
  return {
    ...queryConfig.notifications,
    queryKey: ['notifications'],
  };
}

/**
 * Helper function to get unread count query config
 */
export function getUnreadCountQueryConfig() {
  return {
    ...queryConfig.notifications,
    queryKey: ['notifications', 'unread-count'],
  };
}

/**
 * Helper function to get users query config
 */
export function getUsersQueryConfig() {
  return {
    ...queryConfig.users,
    queryKey: ['users'],
  };
}
