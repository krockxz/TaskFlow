# Server Actions API - TaskFlow (Fixed)

## 1. Overview

TaskFlow uses **Next.js Server Actions** instead of REST API endpoints. Server Actions are functions that run on the server, called directly from client components or forms.

**Key Changes from Original Plan:**
- ✅ Use **Supabase Auth** instead of NextAuth
- ✅ Remove `revalidatePath()` (TanStack Query handles cache)
- ✅ Auth checks via `supabase.auth.getUser()`

---

## 2. Why Server Actions Instead of REST?

| REST API | Server Actions |
|----------|----------------|
| `POST /api/tasks` + fetch/axios | `createTask(formData)` |
| Need to handle loading/error states | Built-in form integration |
| Manual request/response typing | End-to-end type safety |
| Separate API routes | Co-located with components |
| CORS concerns | No CORS (same origin) |

---

## 3. Action Signature Pattern (Fixed)

```typescript
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

async function getSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}

export async function actionName(input: ActionType) {
  // 1. Authentication check (Supabase)
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Validation
  const validated = schema.parse(input);

  // 3. Database operation
  const result = await prisma.doSomething({
    ...validated,
    createdById: user.id,
  });

  // 4. NO revalidatePath (TanStack Query handles this)
  return result;
}
```

---

## 4. Task Actions

### 4.1 Create Task

```typescript
// app/actions/tasks.ts
'use server';

import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { TaskStatus, TaskPriority } from '@prisma/client';

// Schema
const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().max(5000).optional(),
  assignedTo: z.string().uuid('Invalid user ID'),
  priority: z.enum(['low', 'medium', 'high']),
});

// Types (exported for use in components)
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Result type
export type ActionResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

// Helper: Get Supabase server client
async function getSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}

// Action
export async function createTask(input: CreateTaskInput): Promise<ActionResult<Task>> {
  try {
    // Auth check
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate
    const validated = createTaskSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // Create task (no revalidatePath)
    const task = await prisma.task.create({
      data: {
        title: validated.data.title,
        description: validated.data.description,
        assignedTo: validated.data.assignedTo,
        priority: validated.data.priority.toUpperCase() as TaskPriority,
        createdById: user.id,
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

    // Notify assignee
    if (task.assignedTo !== user.id) {
      await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          taskId: task.id,
          message: `${user.user_metadata?.name || user.email} assigned you a task: ${task.title}`,
        },
      });
    }

    // TanStack Query will invalidate on success
    return { success: true, data: task };

  } catch (error) {
    console.error('createTask error:', error);
    return { success: false, error: 'Failed to create task' };
  }
}
```

### 4.2 Update Task Status

```typescript
const updateStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['open', 'in_progress', 'ready_for_review', 'done']),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export async function updateTaskStatus(
  input: UpdateStatusInput
): Promise<ActionResult<Task>> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = updateStatusSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // Get current task
    const current = await prisma.task.findUnique({
      where: { id: validated.data.taskId },
    });

    if (!current) {
      return { success: false, error: 'Task not found' };
    }

    // Update
    const task = await prisma.task.update({
      where: { id: validated.data.taskId },
      data: { status: validated.data.status.toUpperCase() as TaskStatus },
    });

    // Event
    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        eventType: 'STATUS_CHANGED',
        oldStatus: current.status,
        newStatus: task.status,
        changedById: user.id,
      },
    });

    // Notify relevant users
    if (task.assignedTo && task.assignedTo !== user.id) {
      await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          taskId: task.id,
          message: `${user.user_metadata?.name || user.email} changed task status to ${task.status.toLowerCase()}`,
        },
      });
    }

    // No revalidatePath - TanStack Query handles cache
    return { success: true, data: task };

  } catch (error) {
    console.error('updateTaskStatus error:', error);
    return { success: false, error: 'Failed to update task' };
  }
}
```

### 4.3 Update Task Priority

```typescript
const updatePrioritySchema = z.object({
  taskId: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high']),
});

export type UpdatePriorityInput = z.infer<typeof updatePrioritySchema>;

export async function updateTaskPriority(
  input: UpdatePriorityInput
): Promise<ActionResult<Task>> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = updatePrioritySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: 'Validation failed' };
    }

    const task = await prisma.task.update({
      where: { id: validated.data.taskId },
      data: { priority: validated.data.priority.toUpperCase() as TaskPriority },
    });

    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        eventType: 'PRIORITY_CHANGED',
        changedById: user.id,
      },
    });

    return { success: true, data: task };

  } catch (error) {
    return { success: false, error: 'Failed to update priority' };
  }
}
```

### 4.4 Reassign Task

```typescript
const reassignSchema = z.object({
  taskId: z.string().uuid(),
  assignedTo: z.string().uuid(),
});

export type ReassignInput = z.infer<typeof reassignSchema>;

export async function reassignTask(
  input: ReassignInput
): Promise<ActionResult<Task>> {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = reassignSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: 'Validation failed' };
    }

    const task = await prisma.task.update({
      where: { id: validated.data.taskId },
      data: { assignedTo: validated.data.assignedTo },
    });

    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        eventType: 'ASSIGNED',
        changedById: user.id,
      },
    });

    // Notify new assignee
    if (task.assignedTo !== user.id) {
      await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          taskId: task.id,
          message: `${user.user_metadata?.name || user.email} assigned you a task: ${task.title}`,
        },
      });
    }

    return { success: true, data: task };

  } catch (error) {
    return { success: false, error: 'Failed to reassign task' };
  }
}
```

### 4.5 Get Task Detail

```typescript
export async function getTaskDetail(taskId: string) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
      events: {
        include: { changedBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
```

---

## 5. Query Actions (for TanStack Query)

These are read-only actions called by TanStack Query:

```typescript
// app/actions/queries.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function getSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}

// Get all tasks for current user
export async function getTasks(): Promise<Task[]> {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.task.findMany({
    where: {
      OR: [
        { assignedTo: user.id },
        { createdById: user.id },
      ],
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

// Get single task
export async function getTaskById(taskId: string): Promise<Task | null> {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedToUser: { select: { id: true, name: true } },
      events: {
        include: { changedBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
```

---

## 6. Notification Actions

### 6.1 Get Notifications

```typescript
// app/actions/notifications.ts
'use server';

export async function getNotifications(unreadOnly = false) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.notification.findMany({
    where: {
      userId: user.id,
      ...(unreadOnly ? { read: false } : {}),
    },
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}
```

### 6.2 Get Unread Count

```typescript
export async function getUnreadCount(): Promise<number> {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  return prisma.notification.count({
    where: {
      userId: user.id,
      read: false,
    },
  });
}
```

### 6.3 Mark as Read

```typescript
const markReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export async function markNotificationRead(input: z.infer<typeof markReadSchema>) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const validated = markReadSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Invalid notification ID' };
  }

  const notification = await prisma.notification.findUnique({
    where: { id: validated.data.notificationId },
  });

  if (!notification || notification.userId !== user.id) {
    return { success: false, error: 'Notification not found' };
  }

  await prisma.notification.update({
    where: { id: validated.data.notificationId },
    data: { read: true },
  });

  return { success: true };
}
```

### 6.4 Mark All as Read

```typescript
export async function markAllNotificationsRead() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      read: false,
    },
    data: { read: true },
  });

  return { success: true };
}
```

---

## 7. User Actions

### 7.1 Get All Users (for assignment dropdown)

```typescript
export async function getUsers() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      // Use Supabase user metadata for name if available
    },
    orderBy: { email: 'asc' },
  });
}
```

---

## 8. Auth Actions

### 8.1 Sign Up (Supabase Auth)

```typescript
// app/actions/auth.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export async function signUp(input: SignUpInput) {
  const validated = signUpSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        name: validated.data.name,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Create user in our database
  if (data.user) {
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: {},
      create: {
        id: data.user.id,
        email: data.user.email!,
      },
    });
  }

  return { success: true, data };
}
```

### 8.2 Sign In (Supabase Auth)

```typescript
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInInput = z.infer<typeof signInSchema>;

export async function signIn(input: SignInInput) {
  const validated = signInSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
```

### 8.3 Sign Out

```typescript
export async function signOut() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  await supabase.auth.signOut();
  revalidatePath('/login');
}
```

---

## 9. OAuth Callback Route

The OAuth callback is implemented as a Next.js Route Handler (not a Server Action) because it receives redirects from OAuth providers.

### 9.1 Callback Route

```typescript
// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync user to Prisma database
      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.email) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: { email: user.email, updatedAt: new Date() },
          create: { id: user.id, email: user.email },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error on failure
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
```

### 9.2 OAuth Buttons (Client Component)

```typescript
// app/login/components/OAuthButtons.tsx
'use client';

import { createClient } from '@/lib/supabase/client';

type Provider = 'google' | 'github';

export function OAuthButtons({ redirectTo }: { redirectTo?: string }) {
  const handleSocialLogin = async (provider: Provider) => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`,
      },
    });

    if (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={() => handleSocialLogin('google')}>
        Continue with Google
      </button>
      <button onClick={() => handleSocialLogin('github')}>
        Continue with GitHub
      </button>
    </div>
  );
}
```

### 9.3 Middleware Configuration

The `/auth/callback` route must be excluded from middleware protection:

```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/login', '/register', '/'],
  // Note: /auth/callback is intentionally excluded
};
```

---

## 10. Client Component Integration (TanStack Query)

### 9.1 Task Table with TanStack Query

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { getTasks, updateTaskStatus } from '@/app/actions/tasks';

export function TaskTable() {
  const queryClient = useQueryClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  // Mutation with optimistic update
  const { mutate } = useMutation({
    mutationFn: updateTaskStatus,

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map(t => t.id === variables.taskId
          ? { ...t, status: variables.status.toUpperCase() }
          : t
        )
      );

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks'], context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Realtime subscription (invalidate on event)
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
      }, () => {
        // Just signal TanStack Query to refetch
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient, supabase]);

  if (isLoading) return <div>Loading...</div>;
  if (!tasks) return <div>No tasks</div>;

  return (
    <table>
      {tasks.map(task => (
        <tr key={task.id}>
          <td>{task.title}</td>
          <td>
            <select
              value={task.status.toLowerCase()}
              onChange={(e) => mutate({ taskId: task.id, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="ready_for_review">Ready for Review</option>
              <option value="done">Done</option>
            </select>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

---

## 11. Error Handling Pattern

```typescript
// lib/action-wrapper.ts
type ActionFn<TInput, TResult> = (input: TInput) => Promise<TResult>;

export function withErrorHandling<TInput, TResult>(
  action: ActionFn<TInput, TResult>
): ActionFn<TInput, ActionResult<TResult>> {
  return async (input: TInput) => {
    try {
      const supabase = await getSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Unauthorized' };
      }

      const result = await action(input, user);
      return { success: true, data: result };

    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          fieldErrors: error.flatten().fieldErrors,
        };
      }

      console.error('Action error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };
}
```

---

## 12. API Routes (for TanStack Query Client Calls)

While Server Actions are preferred for mutations, TanStack Query needs REST endpoints for client-side data fetching. These route handlers wrap the query actions.

### 10.1 Tasks Query Endpoint

```typescript
// app/api/queries/tasks/route.ts
import { NextResponse } from 'next/server';
import { getTasks } from '@/app/actions/queries';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/queries/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
```

### 10.2 Task Detail Endpoint

```typescript
// app/api/queries/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { getTaskById } from '@/app/actions/queries';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('GET /api/queries/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}
```

### 10.3 Notifications Endpoints

```typescript
// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { getNotifications } from '@/app/actions/notifications';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unread_only') === 'true';

    const notifications = await getNotifications(unreadOnly);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
```

```typescript
// app/api/notifications/unread-count/route.ts
import { NextResponse } from 'next/server';
import { getUnreadCount } from '@/app/actions/notifications';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await getUnreadCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('GET /api/notifications/unread-count error:', error);
    return NextResponse.json({ count: 0 });
  }
}
```

```typescript
// app/api/notifications/mark-read/route.ts
import { NextResponse } from 'next/server';
import { markAllNotificationsRead } from '@/app/actions/notifications';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await markAllNotificationsRead();
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/notifications/mark-read error:', error);
    return NextResponse.json({ error: 'Failed to mark notifications read' }, { status: 500 });
  }
}
```

### 10.4 Users Endpoint

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getUsers } from '@/app/actions/queries';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
```

---

## 13. File Organization

```
app/
├── actions/
│   ├── index.ts           # Re-exports
│   ├── tasks.ts           # Task actions
│   ├── notifications.ts   # Notification actions
│   ├── queries.ts         # Query actions for TanStack Query
│   ├── auth.ts            # Auth actions (Supabase)
│   └── users.ts           # User actions
├── dashboard/
│   └── page.tsx           # Uses getTasks() query
├── tasks/
│   ├── new/
│   │   └── page.tsx       # Uses createTask() action
│   └── [id]/
│       └── page.tsx       # Uses getTaskById() query
└── notifications/
    └── page.tsx           # Uses getNotifications() query
```

---

## 14. Security Considerations

| Concern | Solution |
|---------|----------|
| Unauthorized access | Check `supabase.auth.getUser()` at start of each action |
| Input validation | Zod schemas for all inputs |
| SQL injection | Prisma parameterized queries |
| CSRF | Supabase handles automatically for Server Actions |
| Rate limiting | Add middleware if needed |
| RLS bypass | Server Actions use service role if needed, but check auth first |

---

## 15. Key Changes from Original Plan

| Aspect | Original | Fixed |
|--------|----------|-------|
| Auth Library | NextAuth | **Supabase Auth (@supabase/ssr)** |
| Auth Check | `await auth()` | **`await supabase.auth.getUser()`** |
| Cache Invalidation | `revalidatePath()` | **TanStack Query `invalidateQueries()`** |
| JWT for RLS | Custom JWT (broken) | **Supabase native JWT** |
| Realtime Security | JWT mismatch | **Single JWT source** |
