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
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, () => {
        // Invalidate all task queries with current filter context
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
