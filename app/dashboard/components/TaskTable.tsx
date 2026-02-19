/**
 * TaskTable Component
 *
 * Client Component with TanStack Query for data fetching and caching.
 * Includes optimistic updates and realtime subscriptions.
 * Uses shadcn Table, Badge, Avatar, and Select components.
 * Supports filter-aware query keys for proper cache management.
 * Enhanced with smooth animations for row entrance, hover effects, and interactions.
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
import { CheckCircle2, Circle, Clock, AlertCircle, Github, Inbox } from 'lucide-react';
import { motion } from 'motion/react';
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

// Row animation variants
const rowVariants = {
  hidden: {
    opacity: 0,
    x: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      delay: Math.min(i * 0.03, 0.3), // Stagger with max delay cap
    },
  }),
  hover: {
    backgroundColor: 'hsl(var(--muted) / 0.5)',
    transition: { duration: 0.15 },
  },
};

// Empty state animation variants
const emptyStateVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
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

  // Enhanced Skeleton Loading
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20"
          >
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 flex-1 max-w-xs" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-8 rounded-full" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </motion.div>
        ))}
      </div>
    );
  }

  // Improved Empty State with icon animation
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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6"
        >
          <Inbox className="h-10 w-10 text-muted-foreground" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-foreground"
        >
          {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto"
        >
          {hasActiveFilters
            ? 'Try adjusting your filters to see more results.'
            : 'Create your first task to get started with TaskFlow.'}
        </motion.p>
      </motion.div>
    );
  }

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
              />
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

// Animated Checkbox Component with spring animation
interface AnimatedCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: () => void;
  'aria-label'?: string;
}

function AnimatedCheckbox({ checked, indeterminate, onCheckedChange, 'aria-label': ariaLabel }: AnimatedCheckboxProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={ariaLabel}
      />
    </motion.div>
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
}: AnimatedTableRowProps) {
  return (
    <motion.tr
      key={task.id}
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`transition-colors ${isSelected ? 'bg-muted/50' : ''}`}
    >
      {/* Checkbox cell with animation */}
      <TableCell>
        <motion.div
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            aria-label={`Select task ${task.title}`}
          />
        </motion.div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <motion.a
            href={`/tasks/${task.id}`}
            className="font-medium text-primary hover:underline inline-block"
            whileHover={{ x: 2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {task.title}
          </motion.a>
          {(task as any).github_issue_url && (
            <motion.a
              href={(task as any).github_issue_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Linked to GitHub Issue"
              whileHover={{ scale: 1.1, rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <Github className="h-4 w-4" />
            </motion.a>
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
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Badge variant={getPriorityVariant(task.priority)} className="capitalize">
            {task.priority.toLowerCase()}
          </Badge>
        </motion.div>
      </TableCell>

      <TableCell>
        {task.assignedToUser ? (
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(task.assignedToUser.email)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
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
