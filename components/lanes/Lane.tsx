'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Task } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';
import { TaskCard } from './TaskCard';
import { OnlineIndicator } from './OnlineIndicator';
import { cn } from '@/lib/utils';

interface LaneProps {
  user: { id: string; email: string; timezone?: string | null };
  tasks: Task[];
}

export function Lane({ user, tasks }: LaneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: user.id,
  });

  const userInitial = user.email.charAt(0).toUpperCase();
  const userTimezone = user.timezone || 'UTC';
  const localTime = formatInTimeZone(new Date(), userTimezone, 'HH:mm');

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
          <OnlineIndicator userId={user.id} />
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto rounded-md transition-colors duration-200",
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
