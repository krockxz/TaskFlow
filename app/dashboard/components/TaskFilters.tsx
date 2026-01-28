'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import type { TaskStatus, TaskPriority, DateRangePreset } from '@/lib/types';

interface TaskFiltersProps {
  users: { id: string; email: string }[];
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'READY_FOR_REVIEW', label: 'Ready for Review' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'all_time', label: 'All time' },
];

/**
 * TaskFilters component
 *
 * Collapsible sidebar with filter controls for tasks.
 * Manages URL state for shareable filter views.
 */
export default function TaskFilters({ users }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Get current filters from URL
  const statusFilter = searchParams.get('status')?.split(',') || [];
  const priorityFilter = searchParams.get('priority')?.split(',') || [];
  const assignedTo = searchParams.get('assignedTo') || undefined;
  const dateRange = searchParams.get('dateRange') as DateRangePreset | undefined;
  const search = searchParams.get('search') || undefined;

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/dashboard?${params.toString()}`);
  };

  // Toggle status filter
  const toggleStatus = (status: TaskStatus) => {
    const updated = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    updateFilters({ status: updated.length > 0 ? updated.join(',') : undefined });
  };

  // Toggle priority filter
  const togglePriority = (priority: TaskPriority) => {
    const updated = priorityFilter.includes(priority)
      ? priorityFilter.filter(p => p !== priority)
      : [...priorityFilter, priority];
    updateFilters({ priority: updated.length > 0 ? updated.join(',') : undefined });
  };

  // Clear all filters
  const clearAll = () => {
    router.push('/dashboard');
    setOpen(false);
  };

  const hasActiveFilters = statusFilter.length > 0 || priorityFilter.length > 0 || assignedTo || dateRange || search;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {statusFilter.length + priorityFilter.length + (assignedTo ? 1 : 0) + (dateRange ? 1 : 0) + (search ? 1 : 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by title..."
              value={search || ''}
              onChange={(e) => updateFilters({ search: e.target.value || undefined })}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={statusFilter.includes(option.value)}
                    onCheckedChange={() => toggleStatus(option.value)}
                  />
                  <Label htmlFor={`status-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="space-y-2">
              {PRIORITY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${option.value}`}
                    checked={priorityFilter.includes(option.value)}
                    onCheckedChange={() => togglePriority(option.value)}
                  />
                  <Label htmlFor={`priority-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned To Filter */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select
              value={assignedTo || 'all'}
              onValueChange={(value) => updateFilters({ assignedTo: value === 'all' ? undefined : value })}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select
              value={dateRange || 'all_time'}
              onValueChange={(value) => updateFilters({ dateRange: value === 'all_time' ? undefined : value })}
            >
              <SelectTrigger id="dateRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={clearAll}
              disabled={!hasActiveFilters}
            >
              Clear all
            </Button>
            <Button
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
