/**
 * DueDate Component
 *
 * Displays a due date with color coding for overdue/upcoming tasks.
 * Consolidates duplicate logic from TaskTable.
 */

import { formatDate, isToday, isPast, differenceInDays } from '@/lib/utils/date';

export type DueDateVariant = 'overdue' | 'today' | 'soon' | 'normal';

export interface DueDateInfo {
  text: string;
  subtitle: string | null;
  variant: DueDateVariant;
}

/**
 * Get due date information including text, subtitle, and color variant.
 */
export function getDueDateInfo(dueDate: string | Date | null | undefined): DueDateInfo | null {
  if (!dueDate) return null;

  const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isPast(date) && !isToday(date)) {
    const daysOverdue = differenceInDays(today, date);
    return {
      text: formatDate(date, 'date'),
      subtitle: daysOverdue > 0 ? `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}` : 'Overdue',
      variant: 'overdue',
    };
  }

  if (isToday(date)) {
    return {
      text: 'Today',
      subtitle: formatDate(date, 'date'),
      variant: 'today',
    };
  }

  const daysUntil = differenceInDays(date, today);
  if (daysUntil <= 3) {
    return {
      text: formatDate(date, 'date'),
      subtitle: daysUntil > 0 ? `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}` : 'Due soon',
      variant: 'soon',
    };
  }

  return {
    text: formatDate(date, 'date'),
    subtitle: null,
    variant: 'normal',
  };
}

/**
 * Get the CSS class for a due date variant.
 */
export function getDueDateVariantClass(variant: DueDateVariant): string {
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

export interface DueDateProps {
  dueDate: string | Date | null | undefined;
  className?: string;
  showSubtitle?: boolean;
}

/**
 * DueDate Component
 *
 * Displays a due date with color coding based on urgency.
 *
 * @example
 * ```tsx
 * <DueDate dueDate="2024-01-01" />
 * <DueDate dueDate={task.dueDate} showSubtitle />
 * ```
 */
export function DueDate({ dueDate, className = '', showSubtitle = true }: DueDateProps) {
  const info = getDueDateInfo(dueDate);

  if (!info) {
    return <span className={`text-sm text-muted-foreground ${className}`}>-</span>;
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`text-sm font-medium ${getDueDateVariantClass(info.variant)}`}>
        {info.text}
      </span>
      {showSubtitle && info.subtitle && (
        <span className="text-xs text-muted-foreground">
          {info.subtitle}
        </span>
      )}
    </div>
  );
}

export default DueDate;
