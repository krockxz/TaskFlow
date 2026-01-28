'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FilterX } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '@/lib/types';

const STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  READY_FOR_REVIEW: 'Ready for Review',
  DONE: 'Done',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const DATE_RANGE_LABELS: Record<string, string> = {
  today: 'Today',
  last_7_days: 'Last 7 days',
  last_30_days: 'Last 30 days',
  last_90_days: 'Last 90 days',
};

interface FilterChipsProps {
  users: { id: string; email: string }[];
}

/**
 * FilterChips component
 *
 * Displays removable chips for each active filter.
 * Shows status, priority, assignedTo, dateRange, and search filters.
 * Provides individual filter removal and clear all functionality.
 */
export default function FilterChips({ users }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusFilter = searchParams.get('status')?.split(',') || [];
  const priorityFilter = searchParams.get('priority')?.split(',') || [];
  const assignedTo = searchParams.get('assignedTo');
  const dateRange = searchParams.get('dateRange');
  const search = searchParams.get('search');

  const hasFilters = statusFilter.length > 0 || priorityFilter.length > 0 || assignedTo || dateRange || search;

  if (!hasFilters) {
    return null;
  }

  // Remove a single filter
  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && (key === 'status' || key === 'priority')) {
      const current = params.get(key)?.split(',') || [];
      const updated = current.filter((v: string) => v !== value);
      if (updated.length > 0) {
        params.set(key, updated.join(','));
      } else {
        params.delete(key);
      }
    } else {
      params.delete(key);
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  // Clear all filters
  const clearAll = () => {
    router.push('/dashboard');
  };

  const getUserEmail = (id: string) => {
    return users.find(u => u.id === id)?.email || id;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {/* Status chips */}
      {statusFilter.map((status) => (
        <Badge key={`status-${status}`} variant="secondary" className="gap-1 pr-1">
          Status: {STATUS_LABELS[status as TaskStatus]}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => removeFilter('status', status)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* Priority chips */}
      {priorityFilter.map((priority) => (
        <Badge key={`priority-${priority}`} variant="secondary" className="gap-1 pr-1">
          Priority: {PRIORITY_LABELS[priority as TaskPriority]}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => removeFilter('priority', priority)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* Assigned To chip */}
      {assignedTo && (
        <Badge variant="secondary" className="gap-1 pr-1">
          Assigned: {getUserEmail(assignedTo)}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => removeFilter('assignedTo')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Date Range chip */}
      {dateRange && (
        <Badge variant="secondary" className="gap-1 pr-1">
          {DATE_RANGE_LABELS[dateRange] || dateRange}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => removeFilter('dateRange')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Search chip */}
      {search && (
        <Badge variant="secondary" className="gap-1 pr-1">
          Search: &quot;{search}&quot;
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => removeFilter('search')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Clear all button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-muted-foreground"
        onClick={clearAll}
      >
        <FilterX className="h-3 w-3" />
        Clear all
      </Button>
    </div>
  );
}
