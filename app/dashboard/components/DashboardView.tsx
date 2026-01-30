'use client';

import { useState } from 'react';
import { LayoutDashboard, Filter, Settings } from 'lucide-react';
import { TaskTable } from './TaskTable';
import FilterChips from './FilterChips';
import { NewTaskDialog } from './NewTaskDialog';
import { GitHubSettings } from '@/components/dashboard/GitHubSettings';

interface DashboardViewProps {
  initialTasks: any[];
  users: { id: string; email: string }[];
  userEmail: string;
}

export function DashboardView({ initialTasks, users, userEmail }: DashboardViewProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'filters' | 'settings'>('dashboard');

  return (
    <>
      {/* View Switcher (could be moved to sidebar) */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-4">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${
            activeView === 'dashboard'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveView('filters')}
          className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${
            activeView === 'filters'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
        <button
          onClick={() => setActiveView('settings')}
          className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${
            activeView === 'settings'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <>
          <header className="border-b px-6 py-4 flex items-center justify-between bg-background sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your tasks and track progress</p>
            </div>
            <NewTaskDialog users={users} />
          </header>

          <div className="p-6">
            <FilterChips users={users} />
            <TaskTable initialTasks={initialTasks} users={users} />
          </div>
        </>
      )}

      {/* Settings View */}
      {activeView === 'settings' && (
        <>
          <header className="border-b px-6 py-4 bg-background sticky top-0 z-10">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage integrations and preferences</p>
          </header>

          <div className="p-6 max-w-3xl">
            <GitHubSettings />
          </div>
        </>
      )}

      {/* Filters View (same as dashboard for now) */}
      {activeView === 'filters' && (
        <>
          <header className="border-b px-6 py-4 flex items-center justify-between bg-background sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-semibold">Filters</h1>
              <p className="text-sm text-muted-foreground">Filter and search tasks</p>
            </div>
            <NewTaskDialog users={users} />
          </header>

          <div className="p-6">
            <FilterChips users={users} />
            <TaskTable initialTasks={initialTasks} users={users} />
          </div>
        </>
      )}
    </>
  );
}
