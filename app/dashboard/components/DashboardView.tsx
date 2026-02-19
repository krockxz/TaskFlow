'use client';

import { TaskTable } from './TaskTable';
import FilterChips from './FilterChips';
import { NewTaskDialog } from './NewTaskDialog';
import { GitHubSettings } from '@/components/dashboard/GitHubSettings';
import type { Task } from '@/lib/types';

interface DashboardViewProps {
  initialTasks: Task[];
  users: { id: string; email: string }[];
  userEmail: string;
  activeView?: 'dashboard' | 'filters' | 'settings';
}

export function DashboardView({
  initialTasks,
  users,
  activeView = 'dashboard',
}: DashboardViewProps) {
  return (
    <div className="flex flex-col h-full">
      {activeView === 'dashboard' && (
        <>
          {/* Solid header */}
          <header className="border-b px-6 py-4 flex items-center justify-between shrink-0 bg-background z-10">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your tasks and track progress</p>
            </div>
            <NewTaskDialog users={users} />
          </header>

          {/* Scrollable content with fade at bottom */}
          <div className="relative flex-1 min-h-0">
            <div className="h-full overflow-y-auto px-6 pt-5 pb-16">
              <FilterChips users={users} />
              <TaskTable initialTasks={initialTasks} users={users} />
            </div>
            {/* Blur fade mask at bottom */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
        </>
      )}

      {activeView === 'settings' && (
        <>
          <header className="border-b px-6 py-4 shrink-0 bg-background z-10">
            <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage integrations and preferences</p>
          </header>

          <div className="relative flex-1 min-h-0">
            <div className="h-full overflow-y-auto px-6 pt-5 pb-16 max-w-3xl">
              <GitHubSettings />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
        </>
      )}

      {activeView === 'filters' && (
        <>
          <header className="border-b px-6 py-4 flex items-center justify-between shrink-0 bg-background z-10">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Filters</h1>
              <p className="text-sm text-muted-foreground">Filter and search tasks</p>
            </div>
            <NewTaskDialog users={users} />
          </header>

          <div className="relative flex-1 min-h-0">
            <div className="h-full overflow-y-auto px-6 pt-5 pb-16">
              <FilterChips users={users} />
              <TaskTable initialTasks={initialTasks} users={users} />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
        </>
      )}
    </div>
  );
}
