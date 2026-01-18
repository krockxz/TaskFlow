/**
 * useRealtimeTasks Hook
 *
 * Subscribes to Supabase Realtime for task changes.
 * Uses Fetch-on-Event pattern to invalidate TanStack Query.
 */

'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * Subscribe to Supabase realtime for tasks.
 * Uses Fetch-on-Event pattern: event signals refetch, not direct payload.
 * This avoids missing join data bug (payload.new lacks assignedToUser, etc.)
 */
export function useRealtimeTasks() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, () => {
        // Just signal TanStack Query to refetch
        // Query fetches fresh data with all includes
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to Supabase realtime for tasks');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);
}
