/**
 * TaskTable Component
 *
 * Client Component with TanStack Query for data fetching and caching.
 * Includes optimistic updates and realtime subscriptions.
 * Uses shadcn Table, Badge, Avatar, and Select components.
 * Supports filter-aware query keys for proper cache management.
 * Enhanced with smooth animations for row entrance, hover effects, and interactions.
 * Includes pagination for performance with large datasets.
 */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { Button } from '@/components/ui/button';
import { BulkActionBar } from './BulkActionBar';
import { CheckCircle2, Circle, Clock, AlertCircle, Github, Inbox, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { STATUS_LABELS, normalizeStatus } from '@/lib/constants/filters';
import { useToast } from '@/lib/hooks/use-toast';
import { format, formatDistanceToNow, isPast, isToday, differenceInDays } from 'date-fns';

interface TaskTableProps {
  initialTasks: Task[];
  users: { id: string; email: string }[];
}

interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

// Due date utilities
const getDueDateInfo = (dueDate: string | null) => {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isPast(date) && !isToday(date)) {
    return {
      text: format(date, 'MMM d'),
      subtitle: `Overdue by ${differenceInDays(today, date)} day${differenceInDays(today, date) > 1 ? 's' : ''}`,
      variant: 'overdue' as const,
    };
  }

  if (isToday(date)) {
    return {
      text: 'Today',
      subtitle: format(date, 'MMM d'),
      variant: 'today' as const,
    };
  }

  const daysUntil = differenceInDays(date, today);
  if (daysUntil <= 3) {
    return {
      text: format(date, 'EEE, MMM d'),
      subtitle: `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
      variant: 'soon' as const,
    };
  }

  return {
    text: format(date, 'MMM d'),
    subtitle: null,
    variant: 'normal' as const,
  };
};

const getDueDateVariant = (variant: 'overdue' | 'today' | 'soon' | 'normal') => {
  switch (variant) {
    case 'overdue':
      return 'text-destructive';
    case 'today':
      return 'text-orange-500';
    case 'soon':
      return 'text-yellow-500 dark:text-yellow-400';
    default:
      return 'text-muted-foreground';
  }
};

// Row animation variants - minimal fade/slide
const rowVariants = {
  hidden: {
    opacity: 0,
  },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as const,
      delay: Math.min(i * 0.02, 0.2),
    },
  }),
};

// Empty state animation variants
const emptyStateVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

// Pagination settings
const ITEMS_PER_PAGE = 25;

export function TaskTable({ initialTasks, users }: TaskTableProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { success, error: toastError } = useToast();
  const searchParams = useSearchParams();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

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
    // Add pagination params
    params.set('page', currentPage.toString());
    params.set('pageSize', ITEMS_PER_PAGE.toString());
    return params.toString();
  }, [filters, currentPage]);

  // Fetch tasks with TanStack Query - filter-aware query key
  const { data: response = { tasks: initialTasks, total: initialTasks.length, page: 1, pageSize: ITEMS_PER_PAGE, totalPages: 1 }, isLoading } = useQuery<TasksResponse>({
    queryKey: ['tasks', filters, currentPage],
    queryFn: async () => {
      const url = `/api/queries/tasks?${queryString}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    initialData: { tasks: initialTasks, total: initialTasks.length, page: 1, pageSize: ITEMS_PER_PAGE, totalPages: 1 },
    staleTime: 5000,
  });

  const tasks = response.tasks;
  const totalPages = response.totalPages;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Track individual task status updates for loading states
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());

  // Memoized handlers with useCallback
  const toggleRow = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === tasks.length) {
        return new Set();
      } else {
        return new Set(tasks.map(t => t.id));
      }
    });
  }, [tasks]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = tasks.length > 0 && selectedIds.size === tasks.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  // Mutation for status updates - filter-aware query key
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Normalize status to uppercase enum value
        body: JSON.stringify({ taskId, status: normalizeStatus(status) }),
      }).then((res) => res.json()),

    // Optimistic update
    onMutate: async (variables) => {
      // Add task to loading state
      setUpdatingTaskIds(prev => new Set(prev).add(variables.taskId));

      await queryClient.cancelQueries({ queryKey: ['tasks', filters, currentPage] });
      const previous = queryClient.getQueryData(['tasks', filters, currentPage]);

      queryClient.setQueryData(['tasks', filters, currentPage], (old: TasksResponse) => ({
        ...old,
        tasks: old.tasks.map((t) =>
          t.id === variables.taskId
            ? { ...t, status: variables.status.toUpperCase() as Task['status'] }
            : t
        ),
      }));

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks', filters, currentPage], context?.previous);
      toastError('Failed to update task status');
    },

    // Show success toast and refetch
    onSuccess: () => {
      success('Task status updated');
    },

    // Always refetch after settle and remove from loading state
    onSettled: (_data, _error, variables) => {
      // Remove task from loading state
      setUpdatingTaskIds(prev => {
        const next = new Set(prev);
        next.delete(variables.taskId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', filters] });
    },
  });

  // Realtime subscription - FETCH-ON-EVENT PATTERN with filter-aware key
  useEffect(() => {
    const channel = supabase
      .channel(`tasks-changes-${Date.now()}`)
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

  // Enhanced Skeleton Loading - matches table structure
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Skeleton className="h-5 w-5 rounded" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-16" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-5 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-7 w-24 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Improved Empty State with minimal animation
  if (tasks.length === 0) {
    const hasActiveFilters = Object.values(filters).some(
      v => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
    );

    return (
      <motion.div
        variants={emptyStateVariants}
        initial="hidden"
        animate="visible"
        className="text-center py-16"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
          <Inbox className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">
          {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          {hasActiveFilters
            ? 'Try adjusting your filters to see more results.'
            : 'Create your first task to get started with TaskFlow.'}
        </p>
      </motion.div>
    );
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {/* Checkbox column */}
            <TableHead className="w-12">
              <AnimatedCheckbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all tasks"
              />
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, index) => {
            const isSelected = selectedIds.has(task.id);
            const statusInfo = statusConfig[task.status] || statusConfig.OPEN;
            const StatusIcon = statusInfo.icon;

            return (
              <AnimatedTableRow
                key={task.id}
                task={task}
                index={index}
                isSelected={isSelected}
                StatusIcon={StatusIcon}
                statusConfig={statusConfig}
                getPriorityVariant={getPriorityVariant}
                getInitials={getInitials}
                updateStatus={updateStatus}
                onToggle={() => toggleRow(task.id)}
                isUpdating={updatingTaskIds.has(task.id)}
              />
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, response.total)} of {response.total} tasks
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, i) => (
                typeof pageNum === 'number' ? (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-9 h-9"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ) : (
                  <span key={i} className="px-2 text-muted-foreground">...</span>
                )
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={Array.from(selectedIds)}
        users={users}
        onClearSelection={clearSelection}
      />
    </>
  );
}

// Animated Checkbox Component with spring animation
interface AnimatedCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: () => void;
  'aria-label'?: string;
}

function AnimatedCheckbox({ checked, indeterminate, onCheckedChange, 'aria-label': ariaLabel }: AnimatedCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
    />
  );
}

// Animated Table Row Component
interface AnimatedTableRowProps {
  task: Task;
  index: number;
  isSelected: boolean;
  StatusIcon: React.ComponentType<{ className?: string }>;
  statusConfig: typeof statusConfig;
  getPriorityVariant: (priority: string) => 'default' | 'secondary' | 'outline';
  getInitials: (email: string) => string;
  updateStatus: (params: { taskId: string; status: string }) => void;
  onToggle: () => void;
  isUpdating: boolean;
}

function AnimatedTableRow({
  task,
  index,
  isSelected,
  StatusIcon,
  statusConfig,
  getPriorityVariant,
  getInitials,
  updateStatus,
  onToggle,
  isUpdating,
}: AnimatedTableRowProps) {
  return (
    <motion.tr
      key={task.id}
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className={`transition-colors hover:bg-muted/30 ${isSelected ? 'bg-muted/50' : ''}`}
    >
      {/* Checkbox cell */}
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          aria-label={`Select task ${task.title}`}
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <a
            href={`/tasks/${task.id}`}
            className="font-medium text-primary hover:underline inline-block"
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
          disabled={isUpdating}
        >
          <SelectTrigger className="h-7 w-fit gap-1.5">
            {isUpdating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <StatusIcon className="h-3.5 w-3.5" />
            )}
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
        {task.dueDate ? (
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${getDueDateVariant(getDueDateInfo(task.dueDate)?.variant || 'normal')}`}>
              {getDueDateInfo(task.dueDate)?.text}
            </span>
            {getDueDateInfo(task.dueDate)?.subtitle && (
              <span className="text-xs text-muted-foreground">
                {getDueDateInfo(task.dueDate)?.subtitle}
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
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
    </motion.tr>
  );
}
