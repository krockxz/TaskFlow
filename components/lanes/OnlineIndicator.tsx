'use client';

import { useTaskPresence } from '@/lib/hooks/usePresence';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  userId: string;
  taskId?: string;
}

export function OnlineIndicator({ userId, taskId }: OnlineIndicatorProps) {
  // Note: useTaskPresence signature is (taskId: string, currentUserId: string | undefined)
  // For lane-level presence, we track users viewing the app (not a specific task)
  // The existing hook requires a taskId, so we pass empty string for app-level presence
  const presences = useTaskPresence(taskId || '', userId);

  // Check if the specific user is online (in the presence list)
  const isOnline = presences.some(p => p.userId === userId);

  return (
    <div
      className={cn(
        'h-2.5 w-2.5 rounded-full border-2 border-white',
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      )}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
}
