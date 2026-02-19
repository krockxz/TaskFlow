/**
 * useRealtimeTasks Hook
 *
 * Subscribes to Supabase Realtime for task changes.
 * Uses Fetch-on-Event pattern to invalidate TanStack Query.
 */

'use client';

import { useRealtimeSubscription } from './useRealtimeSubscription';

/**
 * Subscribe to Supabase realtime for tasks.
 * Uses Fetch-on-Event pattern: event signals refetch, not direct payload.
 * This avoids missing join data bug (payload.new lacks assignedToUser, etc.)
 */
export function useRealtimeTasks() {
  useRealtimeSubscription({
    channelName: 'tasks-realtime',
    table: 'tasks',
    events: ['*'],
    queryKeys: [['tasks']],
    logMessage: 'Connected to Supabase realtime for tasks',
  });
}
