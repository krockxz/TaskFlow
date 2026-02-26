/**
 * TaskCard Component (Re-export)
 *
 * Re-exports the UnifiedTaskCard with 'lane' variant as the default for backward compatibility.
 * This maintains the existing API while using the consolidated component.
 */

'use client';

import { UnifiedTaskCard, type UnifiedTaskCardProps } from '@/components/tasks/TaskCard';

// Re-export types with our specific props
export interface TaskCardProps extends Omit<UnifiedTaskCardProps, 'variant' | 'draggable'> {}

// Re-export the component with lane variant as default
export function TaskCard(props: TaskCardProps) {
  return <UnifiedTaskCard {...props} variant="lane" draggable={true} />;
}

// Also export the unified component for direct use if needed
export { UnifiedTaskCard };
export type { UnifiedTaskCardProps };
