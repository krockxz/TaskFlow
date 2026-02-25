'use client';

import { useTaskPresence } from '@/lib/hooks/usePresence';
import { useSession } from '@/lib/hooks/useSession';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  userId: string;
}

export function OnlineIndicator({ userId }: OnlineIndicatorProps) {
  const { user } = useSession();

  // For lane-level presence, we use a shared "timezone-lanes" channel
  // This tracks which users are currently viewing the timezone lanes page
  const presences = useTaskPresence('timezone-lanes', user?.id);

  // Check if the lane user (not current user) is online
  const isOnline = presences.some(p => p.userId === userId);

  return (
    <div
      className={cn(
        'h-2.5 w-2.5 rounded-full border-2 border-background dark:border-white',
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      )}
      title={isOnline ? 'Online now' : 'Offline'}
    />
  );
}
