/**
 * TaskTable Component
 *
 * Client Component with TanStack Query for data fetching and caching.
 * Includes optimistic updates and realtime subscriptions.
 * Uses shadcn Table, Badge, Avatar, and Select components.
 */

'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/lib/types';
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
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

interface TaskTableProps {
  initialTasks: Task[];
}

// Status configuration
const statusConfig = {
  OPEN: {
    label: 'Open',
    variant: 'secondary' as const,
    className: 'bg-secondary text-secondary-foreground',
    icon: Circle,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    variant: 'outline' as const,
    className: 'bg-blue-500 text-white hover:bg-blue-600 border-transparent',
    icon: Clock,
  },
  READY_FOR_REVIEW: {
    label: 'Ready for Review',
    variant: 'outline' as const,
    className: 'bg-yellow-500 text-white hover:bg-yellow-600 border-transparent',
    icon: AlertCircle,
  },
  DONE: {
    label: 'Done',
    variant: 'outline' as const,
    className: 'bg-green-500 text-white hover:bg-green-600 border-transparent',
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

export function TaskTable({ initialTasks }: TaskTableProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Fetch tasks with TanStack Query
  const { data: tasks = initialTasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/queries/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    initialData: initialTasks,
    staleTime: 5000,
  });

  // Mutation for status updates
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      }).then((res) => res.json()),

    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[]) =>
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
      queryClient.setQueryData(['tasks'], context?.previous);
    },

    // Always refetch after settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Realtime subscription - FETCH-ON-EVENT PATTERN
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, () => {
        // Signal TanStack Query to refetch
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

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
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No tasks yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const statusInfo = statusConfig[task.status] || statusConfig.OPEN;
          const StatusIcon = statusInfo.icon;

          return (
            <TableRow key={task.id}>
              <TableCell>
                <a
                  href={`/tasks/${task.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {task.title}
                </a>
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
  );
}
