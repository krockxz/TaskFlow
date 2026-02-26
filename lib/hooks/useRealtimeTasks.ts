/**
 * useRealtimeTasks Hook
 *
 * Subscribes to Supabase Realtime for task changes.
 * Uses Fetch-on-Event pattern to invalidate TanStack Query.
 */

'use client';

import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { TaskFilters } from '@/lib/types';

/**
 * Subscribe to Supabase realtime for tasks.
 * Uses Fetch-on-Event pattern: event signals refetch, not direct payload.
 * This avoids missing join data bug (payload.new lacks assignedToUser, etc.)
 *
 * @param filters - Optional task filters for filter-aware query key invalidation
 * @param currentPage - Optional current page number for pagination-aware invalidation
 */
export function useRealtimeTasks(filters?: TaskFilters, currentPage?: number) {
  // Build dynamic query keys based on filters and pagination
  // This ensures that when filters change, the correct queries are invalidated
  const queryKeys = filters
    ? [['tasks', filters, currentPage]].filter(Boolean)
    : [['tasks']];

  useRealtimeSubscription({
    channelName: 'tasks-realtime',
    table: 'tasks',
    events: ['*'],
    queryKeys,
    logMessage: 'Connected to Supabase realtime for tasks',
  });
}
