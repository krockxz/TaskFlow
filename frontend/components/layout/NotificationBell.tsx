/**
 * NotificationBell Component
 *
 * Displays a bell icon with unread notification count badge.
 * Opens a popover dropdown showing recent notifications.
 * Integrates with TanStack Query and Supabase Realtime.
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRealtimeNotifications } from '@/lib/hooks/useRealtimeNotifications';
import { useSession } from '@/lib/hooks/useSession';
import type { Notification } from '@/lib/types';

interface UnreadCountResponse {
  count: number;
}

interface MarkReadResponse {
  success: boolean;
}

/**
 * Fetches notifications for the current user.
 */
async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/notifications');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

/**
 * Fetches the unread notification count for the current user.
 */
async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const response = await fetch('/api/notifications/unread-count');
  if (!response.ok) {
    return { count: 0 };
  }
  return response.json();
}

/**
 * Marks all notifications as read for the current user.
 */
async function markAllAsRead(): Promise<MarkReadResponse> {
  const response = await fetch('/api/notifications/mark-read', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to mark notifications as read');
  }
  return response.json();
}

/**
 * Formats a notification date for display.
 */
function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * NotificationBell component properties.
 */
export interface NotificationBellProps {
  /**
   * Optional className for additional styling.
   */
  className?: string;
}

/**
 * NotificationBell Component
 *
 * Displays a bell icon with unread count badge and a dropdown popover
 * showing recent notifications. Integrates with Supabase Realtime for
 * automatic updates when new notifications arrive.
 *
 * @example
 * ```tsx
 * <NotificationBell />
 * ```
 */
export function NotificationBell({ className }: NotificationBellProps) {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Subscribe to realtime notifications
  // This invalidates ['notifications'] query when INSERT/UPDATE events occur
  useRealtimeNotifications(user?.id);

  // Query for notification list (popover content)
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    error: notificationsError,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  // Query for unread count (badge)
  const {
    data: unreadData = { count: 0 },
    isLoading: isLoadingCount,
  } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Handle popover open
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Mark as read when opening if there are unread notifications
    if (open && unreadData.count > 0 && !markReadMutation.isPending) {
      markReadMutation.mutate();
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const unreadCount = unreadData.count;
  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={`relative inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className || ''}`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-xs rounded-full"
          >
            {displayCount}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 max-h-[400px] overflow-y-auto"
      >
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>

        {isLoadingNotifications ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notificationsError ? (
          <div className="p-4 text-center text-sm text-destructive">
            Failed to load notifications
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <a
                  href={`/tasks/${notification.taskId}`}
                  className={`block p-4 hover:bg-accent transition-colors ${
                    !notification.read ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <p className="text-sm font-medium leading-tight mb-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {notification.task && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {notification.task.title}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
