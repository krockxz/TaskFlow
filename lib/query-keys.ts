/**
 * TanStack Query Keys Factory
 *
 * Centralized query key definitions for type-safe cache management.
 * Provides a single source of truth for all query keys used in the app.
 */

import type { TaskStatus, TaskPriority, DateRangePreset } from './types';

/**
 * Base query keys for the application.
 * Ensures consistency and enables easy cache invalidation.
 */
export const queryKeys = {
  /**
   * Task-related query keys.
   */
  tasks: {
    /** All tasks list */
    all: ['tasks'] as const,
    /** Tasks with filters */
    filtered: (filters: {
      status?: TaskStatus[];
      priority?: TaskPriority[];
      assignedTo?: string;
      dateRange?: DateRangePreset;
      search?: string;
    }) => ['tasks', 'filtered', filters] as const,
    /** Single task by ID */
    detail: (id: string) => ['tasks', id] as const,
  },

  /**
   * Notification-related query keys.
   */
  notifications: {
    /** All notifications list */
    all: ['notifications'] as const,
    /** Unread count */
    unreadCount: ['notifications', 'unread-count'] as const,
  },

  /**
   * User-related query keys.
   */
  users: {
    /** All users list */
    all: ['users'] as const,
    /** Single user by ID */
    detail: (id: string) => ['users', id] as const,
  },

  /**
   * Analytics-related query keys.
   */
  analytics: {
    /** Status distribution */
    statusDistribution: (range?: DateRangePreset) =>
      ['analytics', 'status-distribution', range] as const,
    /** Priority distribution */
    priorityDistribution: (range?: DateRangePreset) =>
      ['analytics', 'priority-distribution', range] as const,
    /** Tasks per user */
    tasksPerUser: (range?: DateRangePreset) =>
      ['analytics', 'tasks-per-user', range] as const,
  },

  /**
   * GitHub-related query keys.
   */
  github: {
    /** GitHub repositories */
    repos: ['github', 'repos'] as const,
    /** GitHub issues for a repository */
    issues: (repo: string) => ['github', 'issues', repo] as const,
  },
} as const;

/**
 * Type for extracting the inferable query key type.
 */
export type QueryKey = typeof queryKeys;
