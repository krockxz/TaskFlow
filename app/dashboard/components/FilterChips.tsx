'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FilterX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TaskStatus, TaskPriority } from '@/lib/types';
import { STATUS_LABELS, PRIORITY_LABELS, DATE_RANGE_LABELS } from '@/lib/constants/filters';

interface FilterChipsProps {
  users: { id: string; email: string }[];
}

/**
 * FilterChips component
 *
 * Displays removable chips for each active filter.
 * Shows status, priority, assignedTo, dateRange, and search filters.
 * Provides individual filter removal and clear all functionality.
 * Enhanced with smooth entrance/exit animations and hover effects.
 */

// Chip animation variants - minimal, polished transitions
const chipVariants = {
  hidden: {
    opacity: 0,
    y: -4,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as const,
      delay: i * 0.04,
    },
  }),
  exit: {
    opacity: 0,
    x: -8,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

export default function FilterChips({ users }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusFilter = searchParams.get('status')?.split(',') || [];
  const priorityFilter = searchParams.get('priority')?.split(',') || [];
  const assignedTo = searchParams.get('assignedTo');
  const dateRange = searchParams.get('dateRange');
  const search = searchParams.get('search');

  // Collect all active filters for counting
  const allFilters = [
    ...statusFilter.map(s => ({ type: 'status' as const, value: s, label: STATUS_LABELS[s as TaskStatus] })),
    ...priorityFilter.map(p => ({ type: 'priority' as const, value: p, label: PRIORITY_LABELS[p as TaskPriority] })),
    ...(assignedTo ? [{ type: 'assigned' as const, value: assignedTo, label: `Assigned: ${users.find(u => u.id === assignedTo)?.email || assignedTo}` }] : []),
    ...(dateRange ? [{ type: 'dateRange' as const, value: dateRange, label: DATE_RANGE_LABELS[dateRange] || dateRange }] : []),
    ...(search ? [{ type: 'search' as const, value: search, label: `Search: "${search}"` }] : []),
  ];

  const hasFilters = allFilters.length > 0;

  if (!hasFilters) {
    return null;
  }

  // Remove a single filter
  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && (key === 'status' || key === 'priority')) {
      const current = params.get(key)?.split(',') || [];
      const updated = current.filter((v: string) => v !== value);
      if (updated.length > 0) {
        params.set(key, updated.join(','));
      } else {
        params.delete(key);
      }
    } else {
      params.delete(key);
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  // Clear all filters
  const clearAll = () => {
    router.push('/dashboard');
  };

  const getUserEmail = (id: string) => {
    return users.find(u => u.id === id)?.email || id;
  };

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key="filter-chips-container"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-wrap items-center gap-2 py-2"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          Active filters:
        </motion.span>

        <AnimatePresence mode="popLayout">
          {/* Status chips */}
          {statusFilter.map((status, index) => (
            <motion.div
              key={`status-${status}`}
              custom={index}
              variants={chipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Badge variant="secondary" className="gap-1 pr-1">
                Status: {STATUS_LABELS[status as TaskStatus]}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeFilter('status', status)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </motion.div>
          ))}

          {/* Priority chips */}
          {priorityFilter.map((priority, index) => (
            <motion.div
              key={`priority-${priority}`}
              custom={statusFilter.length + index}
              variants={chipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Badge variant="secondary" className="gap-1 pr-1">
                Priority: {PRIORITY_LABELS[priority as TaskPriority]}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeFilter('priority', priority)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </motion.div>
          ))}

          {/* Assigned To chip */}
          {assignedTo && (
            <motion.div
              key="assigned-chip"
              custom={statusFilter.length + priorityFilter.length}
              variants={chipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Badge variant="secondary" className="gap-1 pr-1">
                Assigned: {getUserEmail(assignedTo)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeFilter('assignedTo')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </motion.div>
          )}

          {/* Date Range chip */}
          {dateRange && (
            <motion.div
              key="dateRange-chip"
              custom={statusFilter.length + priorityFilter.length + (assignedTo ? 1 : 0)}
              variants={chipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Badge variant="secondary" className="gap-1 pr-1">
                {DATE_RANGE_LABELS[dateRange] || dateRange}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeFilter('dateRange')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </motion.div>
          )}

          {/* Search chip */}
          {search && (
            <motion.div
              key="search-chip"
              custom={statusFilter.length + priorityFilter.length + (assignedTo ? 1 : 0) + (dateRange ? 1 : 0)}
              variants={chipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Badge variant="secondary" className="gap-1 pr-1">
                Search: &quot;{search}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeFilter('search')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear all button with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: allFilters.length * 0.05 + 0.1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-muted-foreground hover:text-foreground"
            onClick={clearAll}
          >
            <FilterX className="h-3 w-3" />
            Clear all
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
