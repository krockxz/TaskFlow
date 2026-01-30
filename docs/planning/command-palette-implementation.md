# Command Palette Implementation Plan

> **Feature:** Linear-style Command Palette (Cmd+K)
> **Effort Estimate:** 12-14 hours
> **Priority:** High Impact (Viral Feature)

---

## 1. Dependencies

### Packages to Install

```bash
npm install cmdk
```

**Already available:**
- `lucide-react` - Icons (already in package.json v0.562.0)
- `@radix-ui/react-dialog` - Dialog primitive (already installed)
- `next-themes` - Theme toggle (already installed)

---

## 2. Component Structure

```
components/
├── command/
│   ├── CommandMenu.tsx          # Main cmdk wrapper component
│   ├── CommandDialog.tsx        # Dialog wrapper with open/close state
│   ├── CommandActions.tsx       # Action definitions and registry
│   └── CommandProvider.tsx      # Context provider for global state
```

### Where it lives in the layout

The `CommandDialog` should be rendered in the root `app/layout.tsx` inside the `Providers` wrapper:

```tsx
// app/layout.tsx
<Providers>
  <AppHeader />
  <CommandDialog />  {/* Add here */}
  {children}
</Providers>
```

---

## 3. State Management Approach

**Recommended: React Context** (simple, no additional dependencies)

Since the command palette only needs:
- Open/closed state
- Current search query
- Registered actions list

A React Context is sufficient and lighter than adding Zustand.

```tsx
// components/command/CommandProvider.tsx
interface CommandAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  onSelect: () => void;
  context?: 'global' | 'task' | 'dashboard';
}

interface CommandContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  actions: CommandAction[];
  registerAction: (action: CommandAction) => void;
  unregisterAction: (id: string) => void;
}
```

---

## 4. Component: CommandDialog (Base)

```tsx
// components/command/CommandDialog.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { useCommand } from './CommandProvider';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function CommandDialog() {
  const { isOpen, setIsOpen, actions } = useCommand();
  const router = useRouter();

  // Handle keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setIsOpen]);

  const handleSelect = (action: CommandAction) => {
    action.onSelect();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 shadow-lg">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            {actions.map((action) => (
              <Command.Item
                key={action.id}
                onSelect={() => handleSelect(action)}
              >
                <action.icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 5. Action Registry Pattern

### Global Actions (registered in CommandProvider)

```tsx
// components/command/CommandProvider.tsx
const globalActions: CommandAction[] = [
  {
    id: 'navigate-home',
    label: 'Go to Home',
    icon: Home,
    keywords: ['home', 'landing', 'start'],
    onSelect: () => router.push('/'),
    context: 'global',
  },
  {
    id: 'navigate-dashboard',
    label: 'Go to Dashboard',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'tasks', 'list'],
    onSelect: () => router.push('/dashboard'),
    context: 'global',
  },
  {
    id: 'create-task',
    label: 'Create New Task',
    icon: Plus,
    keywords: ['new', 'create', 'add', 'task'],
    onSelect: () => openCreateTaskModal(),
    context: 'global',
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    icon: Sun,
    keywords: ['theme', 'dark', 'light', 'mode'],
    onSelect: () => toggleTheme(),
    context: 'global',
  },
];
```

### Context-Aware Actions (registered from pages)

**Task Detail Page Example:**

```tsx
// app/tasks/[id]/components/TaskDetail.tsx
'use client';

import { useEffect } from 'react';
import { useCommand } from '@/components/command/CommandProvider';
import { Trash2, UserPlus, CheckCircle } from 'lucide-react';

export function TaskDetail({ taskId }: { taskId: string }) {
  const { registerAction, unregisterAction } = useCommand();

  useEffect(() => {
    // Register task-specific actions
    const actions = [
      {
        id: `task-${taskId}-status`,
        label: 'Change Status',
        icon: CheckCircle,
        context: 'task' as const,
        onSelect: () => openStatusDialog(),
      },
      {
        id: `task-${taskId}-assign`,
        label: 'Assign to User',
        icon: UserPlus,
        context: 'task' as const,
        onSelect: () => openAssignDialog(),
      },
      {
        id: `task-${taskId}-delete`,
        label: 'Delete Task',
        icon: Trash2,
        context: 'task' as const,
        onSelect: () => deleteTask(taskId),
      },
    ];

    actions.forEach(registerAction);

    // Cleanup on unmount
    return () => {
      actions.forEach((a) => unregisterAction(a.id));
    };
  }, [taskId, registerAction, unregisterAction]);

  // ... rest of component
}
```

---

## 6. Task Search Integration

For task search within the palette, integrate with TanStack Query:

```tsx
// components/command/CommandActions.tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

function useTaskActions() {
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, status')
        .limit(50);
      return data ?? [];
    },
  });

  return tasks?.map((task) => ({
    id: `task-${task.id}`,
    label: task.title,
    icon: getTaskIcon(task.status),
    keywords: [task.title, task.status],
    onSelect: () => router.push(`/tasks/${task.id}`),
  })) ?? [];
}
```

---

## 7. Implementation Checklist

- [ ] Install `cmdk` package
- [ ] Create `CommandProvider` with context
- [ ] Create base `CommandDialog` component
- [ ] Add keyboard listener (Cmd+K / Ctrl+K)
- [ ] Register global actions (navigation, theme, create task)
- [ ] Integrate with theme toggle
- [ ] Create "Create Task" action that opens modal
- [ ] Add task search functionality
- [ ] Implement context-aware actions on task detail page
- [ ] Test keyboard navigation (arrow keys, Enter, Escape)
- [ ] Add animations for open/close transitions
- [ ] Test across different pages
- [ ] Verify mobile responsiveness

---

## 8. Design Decisions

| Decision | Rationale |
|----------|-----------|
| **React Context over Zustand** | Simpler for this use case, no additional dependency |
| **cmdk library** | Purpose-built for command palettes, handles keyboard nav |
| **Global placement in layout** | Ensures availability on all pages |
| **Action registry pattern** | Allows pages to add/remove context-aware actions |
| **Separate contexts (global, task, dashboard)** | Filter actions based on current page |

---

## 9. Future Enhancements

- [ ] Command history (show recently used)
- [ ] Custom keyboard shortcuts
- [ ] Voice commands integration
- [ ] Fuzzy search scoring improvements
- [ ] Command aliases
- [ ] Multi-step commands (e.g., "Create task → assign to → X")
