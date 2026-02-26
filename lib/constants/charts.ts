/**
 * Chart Constants
 *
 * Shared configuration for chart components (Recharts).
 * Ensures consistent sizing, margins, and styling across all charts.
 */

/**
 * Default chart dimensions
 */
export const CHART_DIMENSIONS = {
  /** Default chart height in pixels */
  DEFAULT_HEIGHT: 300,
  /** Compact chart height for smaller cards */
  COMPACT_HEIGHT: 200,
  /** Tall chart height for detailed views */
  TALL_HEIGHT: 400,
} as const;

/**
 * Standard chart margins
 * Provides space for axes labels and titles
 */
export const CHART_MARGIN = {
  /** Default margin for most charts */
  DEFAULT: { top: 20, right: 30, left: 20, bottom: 60 },
  /** Compact margin for small charts */
  COMPACT: { top: 10, right: 10, left: 10, bottom: 30 },
  /** Minimal margin for pie/donut charts */
  MINIMAL: { top: 0, right: 0, left: 0, bottom: 0 },
} as const;

/**
 * Pie chart specific settings
 */
export const PIE_CHART = {
  /** Default outer radius */
  OUTER_RADIUS: 80,
  /** Compact outer radius */
  COMPACT_RADIUS: 60,
  /** Donut chart inner radius */
  INNER_RADIUS: 40,
} as const;

/**
 * Chart colors using CSS variables
 */
export const CHART_COLORS = {
  /** Primary color (main data) */
  PRIMARY: 'hsl(var(--primary))',
  /** Chart color 1 */
  CHART_1: 'hsl(var(--chart-1))',
  /** Chart color 2 */
  CHART_2: 'hsl(var(--chart-2))',
  /** Chart color 3 */
  CHART_3: 'hsl(var(--chart-3))',
  /** Chart color 4 */
  CHART_4: 'hsl(var(--chart-4))',
  /** Chart color 5 */
  CHART_5: 'hsl(var(--chart-5))',
  /** Secondary/muted color */
  SECONDARY: 'hsl(var(--secondary))',
  /** Destructive color */
  DESTRUCTIVE: 'hsl(var(--destructive))',
  /** Muted foreground */
  MUTED: 'hsl(var(--muted))',
} as const;

/**
 * Tooltip styling configuration
 */
export const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  color: 'hsl(var(--foreground))',
} as const;
