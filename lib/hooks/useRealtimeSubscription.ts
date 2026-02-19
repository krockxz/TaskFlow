/**
 * Generic Realtime Subscription Hook
 *
 * Reusable Supabase realtime subscription logic.
 * Uses Fetch-on-Event pattern to invalidate TanStack Query.
 */

'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * Events that can be subscribed to in Supabase realtime.
 */
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Configuration options for realtime subscription.
 */
interface RealtimeSubscriptionOptions {
  /** Unique channel name for this subscription */
  channelName: string;
  /** Table name to subscribe to */
  table: string;
  /** Filter string (e.g., "userId=eq.123") */
  filter?: string;
  /** Events to listen for (default: all) */
  events?: RealtimeEvent[];
  /** TanStack Query keys to invalidate on events */
  queryKeys: string[][];
  /** Log message when subscribed (optional) */
  logMessage?: string;
}

/**
 * Generic hook for subscribing to Supabase realtime changes.
 * Invalidates specified query keys when events occur.
 *
 * @example
 * ```tsx
 * // Subscribe to all task changes
 * useRealtimeSubscription({
 *   channelName: 'tasks-realtime',
 *   table: 'tasks',
 *   events: ['*'],
 *   queryKeys: [['tasks']],
 *   logMessage: 'Connected to Supabase realtime for tasks',
 * });
 *
 * // Subscribe to user-specific notifications
 * useRealtimeSubscription({
 *   channelName: 'notifications-realtime',
 *   table: 'notifications',
 *   filter: `userId=eq.${userId}`,
 *   events: ['INSERT', 'UPDATE'],
 *   queryKeys: [['notifications'], ['notifications', 'unread-count']],
 *   logMessage: 'Connected to Supabase realtime for notifications',
 * });
 * ```
 */
export function useRealtimeSubscription({
  channelName,
  table,
  filter,
  events = ['*'],
  queryKeys,
  logMessage,
}: RealtimeSubscriptionOptions): void {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel(channelName);

    // Subscribe to each specified event
    // Using the actual Supabase pattern from their docs
    for (const event of events) {
      // @ts-ignore - Supabase types are complex, this pattern is correct
      channel.on('postgres_changes', {
        event,
        schema: 'public',
        table,
        filter,
      }, () => {
        // Invalidate all specified query keys
        for (const queryKey of queryKeys) {
          queryClient.invalidateQueries({ queryKey });
        }
      });
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && logMessage) {
        console.log(logMessage);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, channelName, table, filter, events, queryKeys, logMessage]);
}
