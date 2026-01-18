/**
 * usePresence Hook
 *
 * Multi-user presence tracking via Supabase Realtime Presence.
 * Tracks which users are currently viewing a specific task.
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PresenceState } from '@/lib/types';

/**
 * Track multi-user presence for a specific task.
 * Uses Supabase Realtime Presence feature.
 *
 * @param taskId - The task ID to track presence for
 * @param currentUserId - The current user's ID (filtered from results)
 * @returns Array of presence states for other users viewing this task
 *
 * @example
 * ```tsx
 * function TaskDetailPage({ taskId }) {
 *   const { user } = useSession();
 *   const presences = useTaskPresence(taskId, user?.id);
 *
 *   return (
 *     <div>
 *       <h1>Task Details</h1>
 *       {presences.length > 0 && (
 *         <div>
 *           <span>Viewing now: </span>
 *           {presences.map(p => (
 *             <Avatar key={p.userId}>{p.email[0]}</Avatar>
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTaskPresence(taskId: string, currentUserId: string | undefined) {
  const [presences, setPresences] = useState<PresenceState[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!taskId || !currentUserId) return;

    const channel = supabase.channel(`task-presence-${taskId}`);

    // Subscribe to presence events
    channel
      .on('presence', { event: 'sync' }, () => {
        // Get all current presences from the channel
        const state = channel.presenceState<PresenceState>();
        const presenceList: PresenceState[] = [];

        // Extract presence data from each key
        // state is { key: [presences] } where each key is a presence identifier
        Object.values(state).forEach((presenceArray: any) => {
          if (Array.isArray(presenceArray)) {
            presenceArray.forEach((data: any) => {
              if (data && data.userId) {
                presenceList.push(data as PresenceState);
              }
            });
          }
        });

        setPresences(presenceList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined task presence:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left task presence:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get current user info for presence tracking
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Track current user's presence on this task
            await channel.track({
              userId: user.id,
              email: user.email || '',
              taskId,
              lastSeen: Date.now(),
            } as PresenceState);
          }
        }
      });

    return () => {
      // Untrack current user and remove channel
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [taskId, currentUserId, supabase]);

  // Filter out current user and deduplicate by userId
  return presences
    .filter(p => p.userId !== currentUserId)
    .filter((p, index, self) =>
      index === self.findIndex((t) => t.userId === p.userId)
    );
}
