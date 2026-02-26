import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { TaskStatus, TaskPriority, DateRangePreset } from '@/lib/types';

export function useTaskFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const statusFilter = searchParams.get('status')?.split(',') || [];
    const priorityFilter = searchParams.get('priority')?.split(',') || [];
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const dateRange = searchParams.get('dateRange') as DateRangePreset | undefined;
    const search = searchParams.get('search') || undefined;

    const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.push(`/dashboard?${params.toString()}`);
    }, [router, searchParams]);

    const toggleStatus = useCallback((status: TaskStatus) => {
        const currentStatus = searchParams.get('status')?.split(',') || [];
        const updated = currentStatus.includes(status)
            ? currentStatus.filter(s => s !== status)
            : [...currentStatus, status];
        updateFilters({ status: updated.length > 0 ? updated.join(',') : undefined });
    }, [searchParams, updateFilters]);

    const togglePriority = useCallback((priority: TaskPriority) => {
        const currentPriority = searchParams.get('priority')?.split(',') || [];
        const updated = currentPriority.includes(priority)
            ? currentPriority.filter(p => p !== priority)
            : [...currentPriority, priority];
        updateFilters({ priority: updated.length > 0 ? updated.join(',') : undefined });
    }, [searchParams, updateFilters]);

    const setAssignedTo = useCallback((userId: string | undefined) => {
        updateFilters({ assignedTo: userId === 'all' ? undefined : userId });
    }, [updateFilters]);

    const setDateRange = useCallback((range: DateRangePreset | undefined) => {
        updateFilters({ dateRange: range === 'all_time' ? undefined : range });
    }, [updateFilters]);

    const setSearch = useCallback((term: string | undefined) => {
        updateFilters({ search: term });
    }, [updateFilters]);

    const clearAll = useCallback(() => {
        router.push('/dashboard');
    }, [router]);

    return {
        status: statusFilter,
        priority: priorityFilter,
        assignedTo,
        dateRange,
        search,
        toggleStatus,
        togglePriority,
        setAssignedTo,
        setDateRange,
        setSearch,
        clearAll,
    };
}
