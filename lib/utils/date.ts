/**
 * Date Formatting Utilities
 *
 * Reusable date formatting functions for consistent date display across the app.
 */

/**
 * Formats a date string as a relative time (e.g., "5m ago", "2h ago", "3d ago").
 *
 * @param dateString - ISO date string to format
 * @returns Formatted relative time string
 *
 * @example
 * ```ts
 * formatRelativeDate('2024-01-01T10:00:00Z'); // "2d ago" (depending on current time)
 * ```
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
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
 * Formats a date string as a localized date string.
 *
 * @param dateString - ISO date string to format
 * @param locale - Locale to use for formatting (default: 'en-US')
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate('2024-01-01T10:00:00Z'); // "1/1/2024"
 * formatDate('2024-01-01T10:00:00Z', 'en-GB'); // "01/01/2024"
 * ```
 */
export function formatDate(dateString: string, locale = 'en-US'): string {
  return new Date(dateString).toLocaleDateString(locale);
}

/**
 * Formats a date string as a localized date and time string.
 *
 * @param dateString - ISO date string to format
 * @param locale - Locale to use for formatting (default: 'en-US')
 * @returns Formatted date and time string
 *
 * @example
 * ```ts
 * formatDateTime('2024-01-01T10:00:00Z'); // "1/1/2024, 10:00:00 AM"
 * ```
 */
export function formatDateTime(dateString: string, locale = 'en-US'): string {
  return new Date(dateString).toLocaleString(locale);
}

/**
 * Formats a date string as a short time (e.g., "10:30 AM").
 *
 * @param dateString - ISO date string to format
 * @param locale - Locale to use for formatting (default: 'en-US')
 * @returns Formatted time string
 *
 * @example
 * ```ts
 * formatTime('2024-01-01T10:30:00Z'); // "10:30 AM"
 * ```
 */
export function formatTime(dateString: string, locale = 'en-US'): string {
  return new Date(dateString).toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Checks if a date is today.
 *
 * @param dateString - ISO date string to check
 * @returns True if the date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is within the last N days.
 *
 * @param dateString - ISO date string to check
 * @param days - Number of days to look back
 * @returns True if the date is within the specified range
 */
export function isWithinLastDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  return diffDays >= 0 && diffDays <= days;
}
