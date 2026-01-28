# Implementation Plan - TaskFlow (Fixed: Supabase Auth + TanStack Query)

## 1. Prerequisites

Before starting, ensure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x+ | `npm --version` |
| Git | Latest | `git --version` |
| Supabase Account | Free tier | Sign up at supabase.com |

**No local PostgreSQL or Redis needed!** Everything runs on Supabase.

---

## 2. Project Initialization

### 2.1 Create Next.js Project

```bash
# Create project
npx create-next-app@latest taskflow --typescript --tailwind --app --no-src-dir

cd taskflow

# Install core dependencies
npm install @supabase/supabase-js @supabase/ssr @prisma/client zod

# Install TanStack Query for state management
npm install @tanstack/react-query

# Install dev dependencies
npm install -D prisma
```

### 2.2 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose organization, name `taskflow`, region closest to you
4. Wait for provisioning (~2 minutes)
5. Go to **Settings → API** and copy:
   - Project URL
   - anon/public key

### 2.3 Configure Environment Variables (CRITICAL FIX)

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database URLs (CRITICAL: Separate pooler from direct)
# DATABASE_URL: Transaction pooler for Server Actions (port 6543)
# Get from: Supabase Dashboard → Database → Connection String → Transaction mode
DATABASE_URL=postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# DIRECT_URL: Direct connection for Prisma migrations only (port 5432)
# Get from: Supabase Dashboard → Database → Connection String → Session mode
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

**Why two URLs?**
- `DATABASE_URL` (pooler port 6543): For Server Actions and app queries. Handles many short-lived connections from serverless functions.
- `DIRECT_URL` (port 5432): Only for Prisma migrations. Migrations need a stable, long-lived connection.

### 2.4 Environment Variables Template (.env.example)

Create `.env.example` (for version control, does NOT contain secrets):

```bash
# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
# Get these from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================================================
# DATABASE CONNECTION STRINGS
# ============================================================================
# CRITICAL: These are TWO DIFFERENT URLs for different purposes

# DATABASE_URL - Transaction Pooler (port 6543)
# Purpose: Server Actions, API routes, app queries
# Provider: Pgbouncer in Transaction mode
# Connection type: Short-lived, high-concurrency
# Get from: Supabase Dashboard → Database → Connection String → Transaction mode
# Format: postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
DATABASE_URL="postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres"

# DIRECT_URL - Direct Connection (port 5432)
# Purpose: Prisma migrations ONLY (npx prisma db push/reset)
# Provider: Direct PostgreSQL connection
# Connection type: Long-lived, stable
# Get from: Supabase Dashboard → Database → Connection String → Session mode
# Format: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
DIRECT_URL="postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres"

# ============================================================================
# OPTIONAL CONFIGURATION
# ============================================================================
# App URL (for production deployments)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node environment
NODE_ENV=development
```

**How to Get These Values:**

1. **Supabase URL & Keys:**
   - Go to Supabase Dashboard → Your Project → Settings → API
   - Copy Project URL, anon/public key

2. **DATABASE_URL (Transaction Pooler):**
   - Go to Supabase Dashboard → Database → Connection String
   - Select "Transaction" mode (default for pooler)
   - Copy URL, replace `[YOUR-PASSWORD]`
   - Verify port is `6543`

3. **DIRECT_URL (Direct Connection):**
   - Go to Supabase Dashboard → Database → Connection String
   - Select "Session" mode
   - Copy URL, replace `[YOUR-PASSWORD]`
   - Verify port is `5432`

### 2.5 Getting Started Checklist

Follow this step-by-step checklist to set up your local development environment:

```
□ 1. Copy environment template
   cp .env.example .env.local

□ 2. Go to Supabase Dashboard (supabase.com/dashboard)
   - Select your project (or create new one)

□ 3. Get Supabase credentials
   Dashboard → Settings → API
   □ Copy Project URL → paste in .env.local as NEXT_PUBLIC_SUPABASE_URL
   □ Copy anon/public key → paste in .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY

□ 4. Get DATABASE_URL (Transaction Pooler)
   Dashboard → Database → Connection String
   □ Select "Transaction" mode (default)
   □ Copy the connection string
   □ Replace [YOUR-PASSWORD] with your database password
   □ Verify port shows :6543 (pooler)
   □ Paste in .env.local as DATABASE_URL

□ 5. Get DIRECT_URL (Direct Connection)
   Dashboard → Database → Connection String
   □ Select "Session" mode
   □ Copy the connection string
   □ Replace [YOUR-PASSWORD] with your database password
   □ Verify port shows :5432 (direct)
   □ Paste in .env.local as DIRECT_URL

□ 6. Verify your .env.local looks like this:
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
   DATABASE_URL=postgresql://postgres.xxxxx:****@aws-0-***.pooler.supabase.com:6543/postgres
   DIRECT_URL=postgresql://postgres:****@db.****.supabase.co:5432/postgres

   Check these things:
   □ DATABASE_URL port is 6543 (pooler)
   □ DIRECT_URL port is 5432 (direct)
   □ Both URLs use your actual password
   □ No [PLACEHOLDERS] remain

□ 7. Install dependencies
   npm install

□ 8. Push database schema
   npx prisma db push

□ 9. Generate Prisma client
   npx prisma generate

□ 10. Enable Realtime (in Supabase Dashboard)
   Database → Replication →
   □ Enable "tasks" table
   □ Enable "notifications" table
   □ Enable "task_events" table (optional)

□ 11. Run development server
   npm run dev

□ 12. Open http://localhost:3000
```

### 2.6 Pre-Deployment Verification

Before deploying to production, verify these critical settings:

| Setting | Expected Value | How to Verify |
|---------|----------------|---------------|
| `DATABASE_URL` port | `6543` | Check `.env.local` - should end with `:6543/postgres` |
| `DIRECT_URL` port | `5432` | Check `.env.local` - should end with `:5432/postgres` |
| `NEXT_PUBLIC_` prefix | Present on URL/key | Browser-exposed variables must have this prefix |
| Database password | Actual password (not placeholder) | Should NOT contain `[` or `]` |
| Realtime enabled | Tables show in Replication | Supabase Dashboard → Database → Replication |
| RLS policies exist | Can see policies in SQL Editor | Supabase Dashboard → SQL Editor → View Policies |

**Common Mistake:** Using the same connection string for both `DATABASE_URL` and `DIRECT_URL`. This will cause migrations to fail or connection exhaustion.

**Quick Test:**
```bash
# Test pooler connection (should work)
npx prisma db push

# Test direct connection (also should work)
npx prisma studio
```

Both commands should succeed if your URLs are configured correctly.

---

## 3. Phase 1: Database & Supabase Auth Setup

### 3.1 Checklist

- [ ] Initialize Prisma
- [ ] Create Prisma schema (Users, Tasks, TaskEvents, Notifications)
- [ ] Push schema to Supabase (uses DIRECT_URL)
- [ ] Configure Supabase Auth
- [ ] Create server client helper
- [ ] Set up middleware for route protection
- [ ] Enable Realtime on tables
- [ ] Configure RLS policies

### 3.2 Prisma Schema

Copy from `docs/02-database-design.md` section 3.

**Key points:**
- Includes `directUrl = env("DIRECT_URL")` for migrations
- User model references Supabase Auth users (id matches auth.uid())
- Tasks, TaskEvents, Notifications with proper relations

### 3.3 Initialize Database

```bash
# Push schema to Supabase (uses DIRECT_URL)
npx prisma db push

# Generate Prisma client
npx prisma generate

# Optional: Seed test data
npx prisma db seed
```

### 3.4 Supabase Auth Setup

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

```typescript
// lib/supabase/client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 3.5 Middleware

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Redirect to login if no session
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*'],
};
```

---

## 4. Phase 2: TanStack Query Setup

### 4.1 Checklist

- [ ] Create QueryProvider component
- [ ] Wrap app with QueryProvider
- [ ] Configure QueryClient defaults
- [ ] Create query actions (getTasks, getTaskById)

### 4.2 Query Provider

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4.3 Query Actions

```typescript
// app/actions/queries.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function getTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return prisma.task.findMany({
    where: {
      OR: [{ assignedTo: user.id }, { createdById: user.id }],
    },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getTaskById(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
      events: {
        include: { changedBy: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getUsers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return prisma.user.findMany({
    select: { id: true, email: true },
  });
}
```

---

## 5. Phase 3: Authentication Pages

### 5.1 Checklist

- [ ] Create login page
- [ ] Create register page (uses Supabase Auth)
- [ ] Add form validation with Zod
- [ ] Handle errors
- [ ] Test login flow

### 5.2 Files to Create

```
app/
├── login/
│   └── page.tsx           # Login form
├── register/
│   └── page.tsx           # Register form
└── layout.tsx             # Update with Providers
```

### 5.3 Register Action

```typescript
// app/actions/auth.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(formData: FormData) {
  const supabase = await createClient();

  const validated = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/login');
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const validated = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

---

## 6. Phase 4: Task Management

### 6.1 Checklist

- [ ] Create Server Actions for mutations
- [ ] Build dashboard page (Server Component)
- [ ] Create TaskTable component (Client with TanStack Query)
- [ ] Create new task form
- [ ] Create task detail page
- [ ] Implement status change with optimistic updates

### 6.2 Files to Create

```
app/
├── actions/
│   ├── tasks.ts           # Task Server Actions (mutations)
│   ├── queries.ts         # Query actions (getTasks, getTaskById)
│   └── auth.ts            # Auth actions (register, login, logout)
├── dashboard/
│   ├── page.tsx           # Server Component
│   └── components/
│       ├── TaskTable.tsx  # Client - TanStack Query
│       └── StatusDropdown.tsx
├── tasks/
│   ├── new/
│   │   └── page.tsx       # Create task form
│   └── [id]/
│       └── page.tsx       # Task detail with events
```

### 6.3 Task Server Actions (NO revalidatePath)

```typescript
// app/actions/tasks.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  assignedTo: z.string().uuid().optional(),
});

export async function createTask(input: z.infer<typeof createTaskSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const validated = createTaskSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const task = await prisma.task.create({
    data: {
      ...validated.data,
      createdById: user.id,
    },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
  });

  // Create event
  await prisma.taskEvent.create({
    data: {
      taskId: task.id,
      eventType: 'CREATED',
      newStatus: task.status,
      changedById: user.id,
    },
  });

  // Create notification for assignee
  if (validated.data.assignedTo && validated.data.assignedTo !== user.id) {
    await prisma.notification.create({
      data: {
        userId: validated.data.assignedTo,
        taskId: task.id,
        message: `You have been assigned a new task: ${task.title}`,
      },
    });
  }

  // NO revalidatePath - TanStack Query handles cache invalidation
  return { success: true, data: task };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return { success: false, error: 'Task not found' };
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: status.toUpperCase() },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
  });

  // Create event
  await prisma.taskEvent.create({
    data: {
      taskId,
      eventType: 'STATUS_CHANGED',
      oldStatus: task.status,
      newStatus: status.toUpperCase(),
      changedById: user.id,
    },
  });

  return { success: true, data: updated };
}

export async function assignTask(taskId: string, assignedTo: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { assignedTo },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
  });

  // Create notification
  if (assignedTo !== user.id) {
    await prisma.notification.create({
      data: {
        userId: assignedTo,
        taskId,
        message: `You have been assigned to: ${updated.title}`,
      },
    });
  }

  return { success: true, data: updated };
}
```

### 6.4 TaskTable Component (TanStack Query)

```tsx
// app/dashboard/components/TaskTable.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskStatus } from '@/app/actions/tasks';
import { createClient } from '@/lib/supabase/client';

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedToUser?: { id: string; email: string };
  createdBy: { id: string; email: string };
};

export function TaskTable({ initialTasks }: { initialTasks: Task[] }) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Fetch tasks
  const { data: tasks = initialTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/queries/tasks');
      return res.json();
    },
    initialData: initialTasks,
  });

  // Mutation with optimistic update
  const { mutate } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      updateTaskStatus(taskId, status),

    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map((t) =>
          t.id === variables.taskId
            ? { ...t, status: variables.status.toUpperCase() }
            : t
        )
      );

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },

    // Always refetch after settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Realtime subscription (Fetch-on-Event pattern)
  // Use event as signal to refetch, NOT to push payload directly
  // This avoids the bug where CDC payload lacks joined data (assignedToUser)
  // biome-ignore format: complex hook
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, () => {
        // Just signal TanStack Query to refetch
        // This fetches fresh data with all includes (joined data)
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase, queryClient]);

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left">Title</th>
          <th className="text-left">Status</th>
          <th className="text-left">Priority</th>
          <th className="text-left">Assigned To</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="border-t">
            <td className="py-2">{task.title}</td>
            <td className="py-2">
              <select
                value={task.status.toLowerCase()}
                onChange={(e) =>
                  mutate({ taskId: task.id, status: e.target.value })
                }
                className="border rounded px-2 py-1"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="ready_for_review">Ready for Review</option>
                <option value="done">Done</option>
              </select>
            </td>
            <td className="py-2">{task.priority.toLowerCase()}</td>
            <td className="py-2">{task.assignedToUser?.email || 'Unassigned'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 7. Phase 5: Notifications

### 7.1 Checklist

- [ ] Create notification query actions
- [ ] Build notification bell component
- [ ] Create notification drawer
- [ ] Subscribe to notification changes (Fetch-on-Event)
- [ ] Implement mark as read action
- [ ] Show unread count badge

### 7.2 NotificationBell Component

```tsx
// components/layout/NotificationBell.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationBell() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await fetch('/api/queries/notifications/unread-count');
      const data = await res.json();
      return data.count;
    },
  });

  // Realtime subscription (Fetch-on-Event pattern)
  // biome-ignore format: complex hook
  useEffect(() => {
    const channel = supabase
      .channel('notifications-insert')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, () => {
        // Signal refetch to get accurate count
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase, queryClient]);

  return (
    <button className="relative p-2">
      <span className="text-xl">🔔</span>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

---

## 8. Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Login fails with wrong password
- [ ] Protected routes redirect to login
- [ ] Logout works
- [ ] Session persists across refresh

### Tasks
- [ ] Create task with all fields
- [ ] Create task with minimal fields
- [ ] Update status (optimistic UI works)
- [ ] See updates in real-time across browsers
- [ ] View task detail with event history
- [ ] Reassign task to different user

### Notifications
- [ ] Receive notification on task assignment
- [ ] Receive notification on status change
- [ ] Unread count updates in real-time
- [ ] Mark as read works
- [ ] Real-time notification appears

---

## 9. Deployment

### 9.1 Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - DATABASE_URL (Transaction pooler, port 6543)
# - DIRECT_URL (Direct connection, port 5432)

# Production deploy
vercel --prod
```

### 9.2 Pre-Deployment Checklist

- [ ] All environment variables set (both pooler and direct URLs)
- [ ] Database migrations run on Supabase
- [ ] Realtime enabled on tasks and notifications tables
- [ ] RLS policies configured (works with Supabase Auth)
- [ ] Supabase Auth is enabled

---

## 10. Troubleshooting

### Common Issues

**Issue:** "Too many connections" error
```bash
# Cause: Using direct connection instead of pooler
# Fix: Ensure DATABASE_URL uses port 6543 (pooler)
# DATABASE_URL should be: aws-0-[REGION].pooler.supabase.com:6543
```

**Issue:** "Migration failed" error
```bash
# Cause: Using pooler for migrations
# Fix: Ensure DIRECT_URL is set and points to port 5432
# DIRECT_URL should be: db.[REF].supabase.co:5432
```

**Issue:** Realtime not working
```bash
# Fix: Enable replication in Supabase Dashboard
# Database → Replication → Select tables → Enable
# ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

**Issue:** RLS blocking queries
```sql
-- Fix: Add policies for all operations
-- With Supabase Auth, auth.uid() now works correctly
-- Check in Supabase Dashboard → Database → Policies
```

**Issue:** UI crashes when realtime update arrives
```bash
# Cause: Using payload.new directly (lacks joined data)
-- Fix: Use "Fetch-on-Event" pattern
-- Don't: setTasks(prev.map(t => t.id === payload.new.id ? payload.new : t))
-- Do: queryClient.invalidateQueries(['tasks'])
```

---

## 11. Timeline Estimate

| Phase | Tasks | Estimated Effort |
|-------|-------|------------------|
| Phase 1 | Setup + Database + Supabase Auth | 4-5 hours |
| Phase 2 | TanStack Query setup | 1-2 hours |
| Phase 3 | Auth pages + Register | 2-3 hours |
| Phase 4 | Task CRUD + Dashboard | 6-8 hours |
| Phase 5 | Notifications + Polish | 3-4 hours |
| Deployment | Vercel setup | 1-2 hours |

**Total:** 17-24 hours (approximately 2-3 days of focused development)

---

## 12. Success Criteria

The implementation is complete when:

- [ ] Users can register and login with Supabase Auth
- [ ] Users can create tasks
- [ ] Task status changes instantly across all users (real-time with Fetch-on-Event)
- [ ] Notifications appear for relevant events
- [ ] Optimistic UI makes actions feel instant (TanStack Query)
- [ ] Deployed to Vercel and working
- [ ] Can support 10+ concurrent users without connection issues

---

## 13. Key Differences from Original Plan

| Aspect | Original | Fixed |
|--------|----------|-------|
| Auth | NextAuth.js | **Supabase Auth** (single JWT for RLS + Realtime) |
| State | useOptimistic | **TanStack Query** (handles sync + rollback) |
| Realtime | Push payload directly | **Fetch-on-Event** (invalidate on signal) |
| DB URL | Single URL (conflicting) | **Two URLs** (pooler + direct) |
| Cache | revalidatePath() | **TanStack Query** cache (no revalidatePath) |

---

## 14. Next Steps After MVP

| Feature | Why Later |
|---------|-----------|
| Email notifications | Use in-app notifications first |
| File attachments | Adds complexity with storage |
| Comments on tasks | Nice to have, not core |
| Advanced filtering | Basic status filter is enough |
| Analytics dashboard | Focus on task completion first |
| Mobile app | Responsive web is sufficient |
