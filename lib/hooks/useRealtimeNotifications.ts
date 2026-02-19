/**
 * useRealtimeNotifications Hook
 *
 * Subscribes to Supabase Realtime for notification changes.
 * Uses Fetch-on-Event pattern to invalidate TanStack Query.
 */

'use client';

import { useRealtimeSubscription } from './useRealtimeSubscription';

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
  useRealtimeSubscription({
    channelName: 'notifications-realtime',
    table: 'notifications',
    filter: userId ? `userId=eq.${userId}` : undefined,
    events: ['INSERT', 'UPDATE'],
    queryKeys: [['notifications'], ['notifications', 'unread-count']],
    logMessage: 'Connected to Supabase realtime for notifications',
  });
}
