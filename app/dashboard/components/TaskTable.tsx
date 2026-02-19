/**
 * TaskTable Component
 *
 * Client Component with TanStack Query for data fetching and caching.
 * Includes optimistic updates and realtime subscriptions.
 * Uses shadcn Table, Badge, Avatar, and Select components.
 * Supports filter-aware query keys for proper cache management.
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Task, TaskStatus, TaskPriority, DateRangePreset, TaskFilters } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkActionBar } from './BulkActionBar';
import { CheckCircle2, Circle, Clock, AlertCircle, Github } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/constants/filters';

interface TaskTableProps {
  initialTasks: Task[];
  users: { id: string; email: string }[];
}

// Status configuration with icons and variants (labels from shared constants)
const statusConfig = {
  OPEN: {
    label: STATUS_LABELS.OPEN,
    variant: 'secondary' as const,
    icon: Circle,
  },
  IN_PROGRESS: {
    label: STATUS_LABELS.IN_PROGRESS,
    variant: 'info' as const,
    icon: Clock,
  },
  READY_FOR_REVIEW: {
    label: STATUS_LABELS.READY_FOR_REVIEW,
    variant: 'warning' as const,
    icon: AlertCircle,
  },
  DONE: {
    label: STATUS_LABELS.DONE,
    variant: 'success' as const,
    icon: CheckCircle2,
  },
} as const;

// Priority badge variant
const getPriorityVariant = (priority: string): 'default' | 'secondary' | 'outline' => {
  switch (priority) {
    case 'HIGH':
      return 'default';
    case 'MEDIUM':
      return 'secondary';
    case 'LOW':
      return 'outline';
    default:
      return 'secondary';
  }
};

// Get initials from email
const getInitials = (email: string): string => {
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

export function TaskTable({ initialTasks, users }: TaskTableProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const searchParams = useSearchParams();

  // Build filters from URL
  const filters: TaskFilters = useMemo(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const dateRange = searchParams.get('dateRange') as DateRangePreset | undefined;
    const search = searchParams.get('search') || undefined;

    return {
      status: statusParam?.split(',').filter(Boolean) as TaskStatus[] | undefined,
      priority: priorityParam?.split(',').filter(Boolean) as TaskPriority[] | undefined,
      assignedTo,
      dateRange,
      search,
    };
  }, [searchParams]);

  // Build query string from filters
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status?.length) params.set('status', filters.status.join(','));
    if (filters.priority?.length) params.set('priority', filters.priority.join(','));
    if (filters.assignedTo) params.set('assignedTo', filters.assignedTo);
    if (filters.dateRange) params.set('dateRange', filters.dateRange);
    if (filters.search) params.set('search', filters.search);
    return params.toString();
  }, [filters]);

  // Fetch tasks with TanStack Query - filter-aware query key
  const { data: tasks = initialTasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const url = queryString ? `/api/queries/tasks?${queryString}` : '/api/queries/tasks';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    initialData: initialTasks,
    staleTime: 5000,
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map(t => t.id)));
    }
  };

  const isAllSelected = tasks.length > 0 && selectedIds.size === tasks.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  // Mutation for status updates - filter-aware query key
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      }).then((res) => res.json()),

    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', filters] });
      const previous = queryClient.getQueryData(['tasks', filters]);

      queryClient.setQueryData(['tasks', filters], (old: Task[]) =>
        old.map((t) =>
          t.id === variables.taskId
            ? { ...t, status: variables.status.toUpperCase() as Task['status'] }
            : t
        )
      );

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks', filters], context?.previous);
    },

    // Always refetch after settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', filters] });
    },
  });

  // Realtime subscription - FETCH-ON-EVENT PATTERN with filter-aware key
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, () => {
        // Signal TanStack Query to refetch with current filters
        queryClient.invalidateQueries({ queryKey: ['tasks', filters] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, filters]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    const hasActiveFilters = Object.values(filters).some(
      v => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
    );

    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          {hasActiveFilters ? 'No tasks match your filters.' : 'No tasks yet.'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {hasActiveFilters
            ? 'Try adjusting your filters to see more results.'
            : 'Create your first task to get started.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {/* Checkbox column */}
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all tasks"
              />
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const isSelected = selectedIds.has(task.id);
            const statusInfo = statusConfig[task.status] || statusConfig.OPEN;
            const StatusIcon = statusInfo.icon;

            return (
              <TableRow
                key={task.id}
                className={isSelected ? 'bg-muted/50' : undefined}
              >
                {/* Checkbox cell */}
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleRow(task.id)}
                    aria-label={`Select task ${task.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/tasks/${task.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {task.title}
                    </a>
                    {(task as any).github_issue_url && (
                      <a
                        href={(task as any).github_issue_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Linked to GitHub Issue"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status.toLowerCase()}
                    onValueChange={(value) =>
                      updateStatus({ taskId: task.id, status: value })
                    }
                  >
                    <SelectTrigger className="h-7 w-fit gap-1.5">
                      <StatusIcon className="h-3.5 w-3.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="ready_for_review">Ready for Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(task.priority)} className="capitalize">
                    {task.priority.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignedToUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(task.assignedToUser.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {task.assignedToUser.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={Array.from(selectedIds)}
        users={users}
        onClearSelection={() => setSelectedIds(new Set())}
      />
    </>
  );
}
