'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface TaskCardProps {
  task: Task;
}

const priorityConfig = {
  [TaskPriority.LOW]: { label: 'Low', variant: 'secondary' as const },
  [TaskPriority.MEDIUM]: { label: 'Medium', variant: 'default' as const },
  [TaskPriority.HIGH]: { label: 'High', variant: 'destructive' as const },
};

const statusIcons = {
  [TaskStatus.OPEN]: Clock,
  [TaskStatus.IN_PROGRESS]: MoreHorizontal,
  [TaskStatus.READY_FOR_REVIEW]: AlertCircle,
  [TaskStatus.DONE]: CheckCircle2,
};

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  const StatusIcon = statusIcons[task.status || TaskStatus.OPEN];
  const priority = priorityConfig[task.priority || TaskPriority.MEDIUM];

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileDrag={{ scale: 1.05, rotate: 2 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        <Card
          className={cn(
            'cursor-grab active:cursor-grabbing transition-opacity',
            isDragging && 'opacity-50 shadow-xl'
          )}
        >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
            <StatusIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Badge variant={priority.variant} className="text-xs">
              {priority.label}
            </Badge>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </div>
  );
}
