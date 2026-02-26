/**
 * Date Formatting Utilities
 *
 * Simple date formatting with a unified API.
 */

type DateFormat = 'relative' | 'date' | 'datetime' | 'time';

/**
 * Format a date string based on the specified format type.
 *
 * @param dateString - ISO date string to format
 * @param format - The format type ('relative', 'date', 'datetime', 'time')
 * @param locale - Locale to use for non-relative formats (default: 'en-US')
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate('2024-01-01T10:00:00Z', 'relative');  // "2d ago"
 * formatDate('2024-01-01T10:00:00Z', 'date');      // "1/1/2024"
 * formatDate('2024-01-01T10:00:00Z', 'datetime');  // "1/1/2024, 10:00:00 AM"
 * formatDate('2024-01-01T10:00:00Z', 'time');      // "10:00 AM"
 * ```
 */
export function formatDate(dateString: string | Date | null | undefined, format: DateFormat = 'date', locale = 'en-US'): string {
  if (!dateString) return '-';

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  switch (format) {
    case 'relative':
      return formatRelativeDate(date);
    case 'date':
      return date.toLocaleDateString(locale);
    case 'datetime':
      return date.toLocaleString(locale);
    case 'time':
      return date.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
      });
    default:
      return date.toLocaleDateString(locale);
  }
}

/**
 * Formats a date as a relative time (e.g., "5m ago", "2h ago", "3d ago").
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Checks if a date is today.
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is in the past.
 */
export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate.getTime() < today.getTime();
}

/**
 * Calculates the difference in days between two dates.
 */
export function differenceInDays(dateLeft: Date, dateRight: Date): number {
  const left = new Date(dateLeft);
  const right = new Date(dateRight);
  left.setHours(0, 0, 0, 0);
  right.setHours(0, 0, 0, 0);
  return Math.round((left.getTime() - right.getTime()) / 86400000);
}
