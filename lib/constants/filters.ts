/**
 * Filter Constants
 *
 * Shared constants for status, priority, and other filter options.
 * Used across components to maintain consistency and avoid duplication.
 */

import type { TaskStatus, TaskPriority } from '@/lib/types';

/**
 * Status options with labels for filters and selects.
 */
export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'READY_FOR_REVIEW', label: 'Ready for Review' },
  { value: 'DONE', label: 'Done' },
] as const;

/**
 * Priority options with labels for filters and selects.
 */
export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
] as const;

/**
 * Status label lookup map.
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  READY_FOR_REVIEW: 'Ready for Review',
  DONE: 'Done',
} as const;

/**
 * Priority label lookup map.
 */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
} as const;

/**
 * Date range preset labels.
 */
export const DATE_RANGE_LABELS: Record<string, string> = {
  today: 'Today',
  last_7_days: 'Last 7 days',
  last_30_days: 'Last 30 days',
  last_90_days: 'Last 90 days',
} as const;

/**
 * Normalize status string to uppercase enum value.
 * Handles both uppercase and lowercase inputs from UI components.
 */
export function normalizeStatus(status: string): TaskStatus {
  const upperStatus = status.toUpperCase();
  // Validate it's a valid TaskStatus
  const validStatuses: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE'];
  if (validStatuses.includes(upperStatus as TaskStatus)) {
    return upperStatus as TaskStatus;
  }
  // Default to OPEN if invalid
  return 'OPEN';
}
