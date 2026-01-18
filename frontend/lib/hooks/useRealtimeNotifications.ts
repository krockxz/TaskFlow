/**
 * useRealtimeNotifications Hook
 *
 * Subscribes to Supabase Realtime for notification changes.
 * Uses Fetch-on-Event pattern to invalidate TanStack Query.
 */

'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * Subscribe to Supabase realtime for notifications.
 * Uses Fetch-on-Event pattern: event signals refetch, not direct payload.
 *
 * @param userId - The user ID to filter notifications for
 *
 * @example
 * ```tsx
 * function NotificationComponent() {
 *   const { user } = useSession();
 *   useRealtimeNotifications(user?.id);
 *   const { data: notifications } = useQuery({
 *     queryKey: ['notifications'],
 *     queryFn: fetchNotifications,
 *   });
 *   return <NotificationList notifications={notifications} />;
 * }
 * ```
 */
export function useRealtimeNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `userId=eq.${userId}`,
      }, () => {
        // Invalidate all notification queries on INSERT
        // Query fetches fresh data with all includes
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `userId=eq.${userId}`,
      }, () => {
        // Invalidate all notification queries on UPDATE
        // Query fetches fresh data with all includes
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to Supabase realtime for notifications');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, userId]);
}
