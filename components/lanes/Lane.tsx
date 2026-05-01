'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatInTimeZone } from 'date-fns-tz';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

export interface LaneTask {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  dueDate: Date | null;
  assignedTo: string | null;
  githubIssueNumber: number | null;
}

interface LaneProps {
  user: { id: string; email: string; timezone?: string | null };
  tasks: LaneTask[];
}

function isValidTimezone(timezone: string): boolean {
  try {
    new Date().toLocaleString('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function Lane({ user, tasks }: LaneProps) {
  const [now, setNow] = useState(() => new Date());
  const { setNodeRef, isOver } = useDroppable({
    id: user.id,
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const userInitial = user.email.charAt(0).toUpperCase();
  const userTimezone = useMemo(() => {
    if (!user.timezone) return 'UTC';
    return isValidTimezone(user.timezone) ? user.timezone : 'UTC';
  }, [user.timezone]);

  const localTime = useMemo(() => formatInTimeZone(now, userTimezone, 'HH:mm'), [now, userTimezone]);

  return (
    <Card className={cn(
      "flex-shrink-0 w-80 min-w-[280px] sm:w-80 transition-all duration-200",
      isOver && "border-primary bg-accent/30 ring-2 ring-primary/20 shadow-lg"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {userTimezone} ({localTime})
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-hidden rounded-md transition-colors duration-200",
            isOver && "bg-primary/5"
          )}
        >
          <SortableContext
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No tasks assigned
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
