/**
 * Status & Priority Constants
 *
 * Centralized configuration for task statuses and priorities.
 * Includes colors, labels, and icon mappings for consistent UI.
 */

import type { TaskStatus, TaskPriority } from '@/lib/types';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

/**
 * Status configuration with visual properties
 */
export const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    variant: 'secondary' as const,
    icon: Circle,
    color: 'hsl(var(--secondary))',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    variant: 'info' as const,
    icon: Clock,
    color: 'hsl(var(--chart-3))',
  },
  READY_FOR_REVIEW: {
    label: 'Ready for Review',
    variant: 'warning' as const,
    icon: AlertCircle,
    color: 'hsl(var(--chart-4))',
  },
  DONE: {
    label: 'Done',
    variant: 'success' as const,
    icon: CheckCircle2,
    color: 'hsl(var(--chart-1))',
  },
} as const satisfies Record<TaskStatus, {
  label: string;
  variant: 'secondary' | 'info' | 'warning' | 'success';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}>;

/**
 * Status-to-label lookup
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: STATUS_CONFIG.OPEN.label,
  IN_PROGRESS: STATUS_CONFIG.IN_PROGRESS.label,
  READY_FOR_REVIEW: STATUS_CONFIG.READY_FOR_REVIEW.label,
  DONE: STATUS_CONFIG.DONE.label,
} as const;

/**
 * Status-to-color lookup
 */
export const STATUS_COLORS: Record<TaskStatus, string> = {
  OPEN: STATUS_CONFIG.OPEN.color,
  IN_PROGRESS: STATUS_CONFIG.IN_PROGRESS.color,
  READY_FOR_REVIEW: STATUS_CONFIG.READY_FOR_REVIEW.color,
  DONE: STATUS_CONFIG.DONE.color,
} as const;

/**
 * Status-to-icon lookup
 */
export const STATUS_ICONS: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  OPEN: STATUS_CONFIG.OPEN.icon,
  IN_PROGRESS: STATUS_CONFIG.IN_PROGRESS.icon,
  READY_FOR_REVIEW: STATUS_CONFIG.READY_FOR_REVIEW.icon,
  DONE: STATUS_CONFIG.DONE.icon,
} as const;

/**
 * Status-to-badge-variant lookup
 */
export const STATUS_VARIANTS: Record<TaskStatus, 'secondary' | 'info' | 'warning' | 'success'> = {
  OPEN: STATUS_CONFIG.OPEN.variant,
  IN_PROGRESS: STATUS_CONFIG.IN_PROGRESS.variant,
  READY_FOR_REVIEW: STATUS_CONFIG.READY_FOR_REVIEW.variant,
  DONE: STATUS_CONFIG.DONE.variant,
} as const;

/**
 * Priority configuration
 */
export const PRIORITY_CONFIG = {
  HIGH: {
    label: 'High',
    variant: 'default' as const,
    color: 'hsl(var(--destructive))',
  },
  MEDIUM: {
    label: 'Medium',
    variant: 'secondary' as const,
    color: 'hsl(var(--primary))',
  },
  LOW: {
    label: 'Low',
    variant: 'outline' as const,
    color: 'hsl(var(--muted))',
  },
} as const satisfies Record<TaskPriority, {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
  color: string;
}>;

/**
 * Priority-to-label lookup
 */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: PRIORITY_CONFIG.HIGH.label,
  MEDIUM: PRIORITY_CONFIG.MEDIUM.label,
  LOW: PRIORITY_CONFIG.LOW.label,
} as const;

/**
 * Priority-to-color lookup
 */
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  HIGH: PRIORITY_CONFIG.HIGH.color,
  MEDIUM: PRIORITY_CONFIG.MEDIUM.color,
  LOW: PRIORITY_CONFIG.LOW.color,
} as const;

/**
 * Priority-to-badge-variant lookup
 */
export const PRIORITY_VARIANTS: Record<TaskPriority, 'default' | 'secondary' | 'outline'> = {
  HIGH: PRIORITY_CONFIG.HIGH.variant,
  MEDIUM: PRIORITY_CONFIG.MEDIUM.variant,
  LOW: PRIORITY_CONFIG.LOW.variant,
} as const;

/**
 * Helper to get priority variant
 */
export function getPriorityVariant(priority: TaskPriority | string): 'default' | 'secondary' | 'outline' {
  return PRIORITY_VARIANTS[priority as TaskPriority] ?? 'secondary';
}
