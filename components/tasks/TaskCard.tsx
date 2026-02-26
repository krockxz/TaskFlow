/**
 * UnifiedTaskCard Component
 *
 * Consolidates TaskCard (lanes) and MobileTaskCard (dashboard) into a single component.
 * Supports multiple variants for different use cases:
 * - 'lane': Draggable card for timezone lanes (dnd-kit)
 * - 'mobile': Non-draggable card with selection and actions (dashboard mobile view)
 * - 'compact': Minimal card for lists
 */

'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getInitials } from '@/components/ui/user-avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, MoreHorizontal, Github, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import Link from 'next/link';
import { SPRING_PRESETS } from '@/lib/constants/animations';

export type TaskCardVariant = 'lane' | 'mobile' | 'compact';

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

export interface UnifiedTaskCardProps {
  /**
   * The task to display
   */
  task: Task & { assignedToUser?: { id: string; email: string } | null };
  /**
   * Visual variant
   */
  variant?: TaskCardVariant;
  /**
   * Whether the card is selected (for mobile variant)
   */
  isSelected?: boolean;
  /**
   * Whether the card is in a loading state (for mobile variant status update)
   */
  isUpdating?: boolean;
  /**
   * Selection toggle callback (for mobile variant)
   */
  onToggleSelection?: () => void;
  /**
   * Status update callback (for mobile variant)
   */
  onUpdateStatus?: (status: string) => void;
  /**
   * Draggable attributes from dnd-kit (for lane variant - auto-populated)
   */
  draggable?: boolean;
}

/**
 * Get due date info with color coding
 */
function getDueDateInfo(dueDate: string | null) {
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
}

function getDueDateVariant(variant: 'overdue' | 'today' | 'soon' | 'normal') {
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
}

export function UnifiedTaskCard({
  task,
  variant = 'lane',
  isSelected = false,
  isUpdating = false,
  onToggleSelection,
  onUpdateStatus,
  draggable = true,
}: UnifiedTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const StatusIcon = statusIcons[task.status || TaskStatus.OPEN];
  const priority = priorityConfig[task.priority || TaskPriority.MEDIUM];
  const dueDateInfo = getDueDateInfo(task.dueDate ? task.dueDate.toString() : null);

  // Always call hook unconditionally (React rule)
  const draggableState = useDraggable({ id: task.id });
  const { attributes, listeners, setNodeRef, isDragging } = draggable
    ? draggableState
    : { attributes: undefined, listeners: undefined, setNodeRef: undefined, isDragging: false };

  // LANE VARIANT: Draggable card for timezone lanes
  if (variant === 'lane') {

    const DraggableWrapper = draggable ? motion.div : 'div';
    const dragProps = draggable
      ? {
          whileHover: { scale: 1.02, y: -2 },
          whileDrag: { scale: 1.05, rotate: 2 },
          transition: { type: 'spring' as const, ...SPRING_PRESETS.NORMAL },
        }
      : {};

    return (
      <div ref={setNodeRef} {...listeners} {...attributes}>
        <DraggableWrapper {...dragProps}>
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
        </DraggableWrapper>
      </div>
    );
  }

  // MOBILE VARIANT: Non-draggable card with selection and actions
  if (variant === 'mobile') {
    return (
      <Card className={isSelected ? 'bg-muted/50' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Selection Checkbox */}
            {onToggleSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelection}
                aria-label={`Select task ${task.title}`}
                className="mt-0.5"
              />
            )}

            {/* Title and GitHub Link */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/tasks/${task.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {task.title}
                </Link>
                {task.githubIssueUrl && (
                  <a
                    href={task.githubIssueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Linked to GitHub Issue"
                    aria-label="Open GitHub issue"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Status Dropdown - Inline Editable */}
              {onUpdateStatus && (
                <Select
                  value={(task.status || TaskStatus.OPEN).toLowerCase()}
                  onValueChange={onUpdateStatus}
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
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Priority Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={priority.variant} className="capitalize">
              {(task.priority || TaskPriority.MEDIUM).toLowerCase()}
            </Badge>

            {/* Due Date with Color Coding */}
            {dueDateInfo ? (
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${getDueDateVariant(dueDateInfo.variant)}`}>
                  {dueDateInfo.text}
                </span>
                {dueDateInfo.subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {dueDateInfo.subtitle}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No due date</span>
            )}
          </div>

          {/* Assigned User */}
          {task.assignedToUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(task.assignedToUser.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {task.assignedToUser.email}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}

          {/* Expandable Details Section */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-muted/50 mt-2">
                <span className="text-sm">Details</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-2">
              {/* Description */}
              {task.description && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Description: </span>
                  {task.description}
                </div>
              )}

              {/* Updated Date */}
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Updated: </span>
                {new Date(task.updatedAt).toLocaleDateString()}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  }

  // COMPACT VARIANT: Minimal card for lists
  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <StatusIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={priority.variant} className="text-xs">
                {priority.label}
              </Badge>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
