/**
 * TaskDetail Component
 *
 * Client Component displaying task details with event history.
 * Uses shadcn/ui components for consistent styling.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/hooks/useSession';
import { useTaskPresence } from '@/lib/hooks/usePresence';

interface TaskDetailProps {
  task: Task;
  currentUserId: string;
}

const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  READY_FOR_REVIEW: 'Ready for Review',
  DONE: 'Done',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const priorityVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
  LOW: 'secondary',
  MEDIUM: 'default',
  HIGH: 'destructive',
};

const eventTypeLabels: Record<string, string> = {
  CREATED: 'created this task',
  ASSIGNED: 'assigned this task',
  STATUS_CHANGED: 'changed status',
  COMPLETED: 'completed this task',
  PRIORITY_CHANGED: 'changed priority',
};

const getInitials = (email: string): string => {
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

export function TaskDetail({ task, currentUserId }: TaskDetailProps) {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const presences = useTaskPresence(task.id, user?.id);

  const { mutate } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      }).then((res) => res.json()),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'OPEN':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'default';
      case 'READY_FOR_REVIEW':
        return 'outline';
      case 'DONE':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Task Details Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          {/* Task Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{task.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created by {task.createdBy.email} • {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                  {presences.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Viewing now:</span>
                      <div className="flex items-center">
                        {presences.map((p) => (
                          <Avatar
                            key={p.userId}
                            className="h-7 w-7 border-2 border-background -ml-2 first:ml-0"
                            title={p.email}
                          >
                            <AvatarFallback className="text-xs">
                              {getInitials(p.email)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Select
                  value={task.status.toLowerCase()}
                  onValueChange={(value) => mutate({ taskId: task.id, status: value.toUpperCase() })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="ready_for_review">Ready for Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {task.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <p className="mt-1">
                    <Badge variant={getStatusVariant(task.status)}>{statusLabels[task.status]}</Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <p className="mt-1">
                    <Badge variant={priorityVariants[task.priority]}>{priorityLabels[task.priority]}</Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Assigned To</span>
                  <p className="mt-1 text-sm">{task.assignedToUser?.email || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <p className="mt-1 text-sm">{new Date(task.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {task.events && task.events.length > 0 ? (
                  task.events.map((event) => (
                    <div key={event.id} className="flex gap-4 text-sm">
                      <div className="flex-shrink-0 w-24 text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">
                          {event.changedBy.email}
                        </span>{' '}
                        <span className="text-muted-foreground">
                          {eventTypeLabels[event.eventType]}
                        </span>
                        {event.oldStatus && event.newStatus && (
                          <span className="text-muted-foreground">
                            {' '}from <span className="font-medium">{statusLabels[event.oldStatus]}</span> to{' '}
                            <span className="font-medium">{statusLabels[event.newStatus]}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
