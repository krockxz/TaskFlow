# Technical Architecture - TaskFlow (Simplified & Fixed)

## 1. Overview

TaskFlow is an asynchronous team coordination hub built with a **unified Next.js stack**. No separate backend server — Supabase handles database, real-time, and authentication.

```mermaid
graph TB
    subgraph Clients
        A[Alice Browser]
        B[Bob Browser]
        C[Charlie Browser]
    end

    subgraph Vercel
        F[Next.js App Router]
        SA[Server Actions]
        TQ[TanStack Query]
        SC[Server Components]
    end

    subgraph Supabase
        PG[(PostgreSQL)]
        RT[(Realtime/CDC)]
        AUTH[(Supabase Auth)]
    end

    A -->|HTTPS| F
    B -->|HTTPS| F
    C -->|HTTPS| F

    F -->|Server Actions| SA
    F -->|Read Data| PG
    SA -->|Mutations| PG
    F -->|Auth| AUTH
    AUTH -.->|JWT| F
    PG -->|Change Events| RT
    RT -.->|WebSocket Signal| TQ
    TQ -.->|Refetch| PG

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#e1f5ff
    style F fill:#000000,color:#fff
    style SA fill:#333333,color:#fff
    style TQ fill:#ff0080,color:#fff
    style SC fill:#333333,color:#fff
    style PG fill:#336791,color:#fff
    style RT fill:#336791,color:#fff
    style AUTH fill:#336791,color:#fff
```

---

## 2. Technology Stack

### 2.1 Complete Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | Full-stack framework |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Supabase** | 2.x + @supabase/ssr | Database + Realtime + Auth |
| **Prisma** | 6.x | Database ORM |
| **TanStack Query** | 5.x | Server state, caching, optimistic UI |
| **TailwindCSS** | 4.x | Styling |
| **Zod** | 3.x | Validation |

### 2.2 What We Removed (and Why)

| Removed | Replaced With | Reason |
|---------|---------------|--------|
| Express backend | Server Actions | No separate server needed |
| Socket.IO | Supabase Realtime | Built-in PostgreSQL CDC |
| Redis | Supabase Realtime | Managed pub/sub |
| NextAuth.js | **Supabase Auth** | Fixes RLS + Realtime JWT mismatch |
| useOptimistic (manual) | **TanStack Query** | Handles sync + rollback + cache automatically |
| Zustand | TanStack Query cache | Query cache IS the state |

### 2.3 Rationale

- **Single Deployment**: Deploy only to Vercel — no backend server management
- **Managed Services**: Supabase handles DB pooling, backups, real-time infra
- **Type Safety**: Prisma + Zod = end-to-end types
- **Auth Alignment**: Supabase Auth = single JWT for RLS + Realtime + everything
- **40% Less Code**: No API routes, no WebSocket server setup, no auth middleware
- **Robust State**: TanStack Query handles caching, deduplication, optimistic updates, rollback

---

## 3. System Architecture

### 3.1 Component Responsibilities

```
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js (Vercel)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Server Components                       │   │
│  │  • Direct database access via Prisma                    │   │
│  │  • Data fetching at component level                     │   │
│  │  • Zero client JavaScript for reads                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Server Actions                          │   │
│  │  • "use server" directive                                │   │
│  │  • Mutations: createTask, updateStatus, etc.             │   │
│  │  • Zod validation + Supabase Auth check                 │   │
│  │  • NO revalidatePath (TanStack Query handles this)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Client Components                       │   │
│  │  • Interactive UI (forms, dropdowns)                     │   │
│  │  • TanStack Query (useQuery, useMutation)               │   │
│  │  • Optimistic updates via onMutate                      │   │
│  │  • Supabase realtime subscriptions                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│  Supabase DB      │  │  Supabase Realtime│  │  Supabase Auth    │
│  (PostgreSQL)     │  │  (Postgres CDC)   │  │  (Native Auth)    │
│  + RLS Policies   │  │  + JWT auth       │  │  + Row Security   │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

### 3.2 Data Flow: Create Task (Fixed)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client Component
    participant TQ as TanStack Query
    participant SA as Server Action
    participant DB as Supabase PostgreSQL
    participant RT as Realtime (CDC)
    participant O as Other Users

    U->>C: Fill task form, submit
    C->>TQ: useMutation (optimistic update)
    TQ->>TQ: onMutate: Update cache instantly
    TQ->>SA: createTask(input)
    SA->>SA: Check Supabase Auth getUser()
    SA->>DB: INSERT task
    DB-->>SA: Created task
    SA->>DB: INSERT notification
    SA-->>TQ: Return result
    TQ->>TQ: onSuccess: Refetch (or just trust cache)
    DB->>RT: CDC event: INSERT
    RT->>O: Signal via WebSocket
    O->>TQ: invalidateQueries(['tasks'])
    TQ->>DB: Fetch fresh data with joins
    TQ->>O: UI updates with full data
```

### 3.3 Data Flow: Real-Time Status Update (Fixed)

```mermaid
sequenceDiagram
    participant A as Alice (changes status)
    participant TQ as TanStack Query
    participant SA as Server Action
    participant DB as Supabase
    participant RT as Realtime (CDC)
    participant B as Bob (sees update)

    A->>TQ: useMutation(updateTaskStatus)
    TQ->>TQ: onMutate: Optimistic update
    A->>A: UI changes instantly to green
    TQ->>SA: updateTaskStatus(taskId, "done")
    SA->>DB: UPDATE tasks SET status = 'done'
    DB->>DB: Trigger CDC event
    DB->>RT: Emit: postgres_changes (UPDATE)
    RT->>B: Signal via WebSocket
    B->>TQ: invalidateQueries(['tasks'])
    TQ->>DB: Fetch fresh data (includes assignedToUser)
    B->>B: UI updates automatically
```

---

## 4. Authentication (Supabase Native)

### 4.1 Why Supabase Auth Over NextAuth

| Aspect | NextAuth | Supabase Auth |
|--------|----------|---------------|
| RLS Support | ❌ Requires custom JWT | ✅ Built-in |
| Realtime Security | ❌ JWT mismatch | ✅ Same JWT |
| Session Management | Manual | ✅ @supabase/ssr handles it |
| OAuth Providers | More options | Google, GitHub, etc. |
| Complexity | Higher for this stack | **Lower for this stack** |

### 4.2 Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│ Supabase Auth│────▶│  RLS Policies │
│              │     │  (JWT Token)  │     │  auth.uid()  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Realtime    │
                     │  Subscribes  │
                     └──────────────┘
```

### 4.3 Session Flow

1. User visits `/login` → Supabase Auth UI (or custom form)
2. Submit → `supabase.auth.signUp()` or `signInWithPassword()`
3. Success → Supabase creates session, sets HTTP-only cookie
4. Server Components call `createServerClient().auth.getUser()`
5. Client Components use `useSession()` from context
6. Realtime automatically inherits auth from Supabase client

### 4.4 Middleware Pattern

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => request.cookies.get(name)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const response = NextResponse.next()
  if (session) {
    response.cookies.set('access_token', session.access_token)
  }
  return response
}

export const config = { matcher: ['/dashboard/:path*', '/tasks/:path*'] }
```

---

## 5. Real-Time Communication (Supabase + TanStack Query)

### 5.1 The "Fetch-on-Event" Pattern (Fixed)

**Old Buggy Way:**
```typescript
// ❌ Breaks because payload lacks joined data
.on('postgres_changes', (payload) => {
  setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t))
  // CRASH: payload.new.assignedToUser is undefined!
})
```

**New Robust Way:**
```typescript
// ✅ Use event as signal to refetch
.on('postgres_changes', (payload) => {
  queryClient.invalidateQueries({ queryKey: ['tasks'] })
  // TanStack Query fetches fresh data with all includes
})
```

### 5.2 Why This Works

| Step | What Happens | Why It's Better |
|------|--------------|------------------|
| 1. Event arrives | `{ id, title, assigned_to: "uuid" }` | Raw CDC data (no joins) |
| 2. Invalidate | `queryClient.invalidateQueries()` | Triggers refetch |
| 3. Refetch | `getTasks()` with Prisma includes | Gets full joined data |
| 4. Update | State updated with complete data | No crashes, no missing fields |

### 5.3 Subscription Pattern

```typescript
// lib/hooks/useRealtimeTasks.ts
useEffect(() => {
  const channel = supabase
    .channel('tasks-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks',
    }, () => {
      // Just signal TanStack Query to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [queryClient])
```

---

## 6. Security Considerations

| Concern | Solution |
|---------|----------|
| Password storage | Supabase Auth handles hashing |
| SQL injection | Prisma parameterized queries |
| XSS | React auto-escaping, Supabase RLS |
| CSRF | Supabase handles CSRF protection |
| Row access | **Supabase RLS works natively** with auth.uid() |
| API exposure | Server Actions (no public API endpoints) |
| Realtime security | **Supabase JWT works for RLS + Realtime** (no mismatch!) |

### 6.1 Row Level Security (RLS)

Now that we use Supabase Auth, RLS works seamlessly:

```sql
-- Users can only see tasks assigned to them or created by them
CREATE POLICY "Users can view their tasks"
ON tasks FOR SELECT
USING (
  auth.uid()::text = created_by OR
  auth.uid()::text = assigned_to
);

-- This works because:
-- - Server Actions use Supabase Auth getUser()
-- - Realtime subscriptions use the same JWT
-- - Both populate auth.uid() correctly
```

---

## 7. Server Actions Pattern (Fixed)

### 7.1 No More revalidatePath

**Old Way:**
```typescript
// ❌ Manual cache invalidation
export async function createTask(input) {
  const task = await prisma.task.create({ data: input })
  revalidatePath('/dashboard')  // Manual, error-prone
  return task
}
```

**New Way:**
```typescript
// ✅ Let TanStack Query handle cache
export async function createTask(input: CreateTaskInput) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const task = await prisma.task.create({ data: input })
  return task  // TanStack Query will invalidate on success
}
```

### 7.2 Auth Check Pattern

```typescript
// app/actions/tasks.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}

export async function createTask(input: CreateTaskInput) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Rest of action...
}
```

---

## 8. TanStack Query Integration

### 8.1 QueryProvider Setup

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 8.2 Optimistic Update Pattern

```tsx
// app/dashboard/components/TaskTable.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskStatus } from '@/app/actions/tasks';

export function TaskTable() {
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const { mutate } = useMutation({
    mutationFn: updateTaskStatus,

    // Optimistic update
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

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks'], context.previous);
    },

    // Always refetch after settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Render...
}
```

---

## 9. Deployment Architecture

```mermaid
graph TB
    subgraph "Vercel (Frontend + Server)"
        V[Next.js App]
        SA[Server Actions]
    end

    subgraph "Supabase (Backend Services)"
        PG[PostgreSQL Database]
        RT[Realtime Service]
        AUTH[Auth Service]
    end

    V -->|HTTPS (Pooler)| PG
    V -->|HTTPS| AUTH
    AUTH -.->|JWT Cookie| V
    PG -->|CDC| RT
    RT -.->|WSS Signal| V

    style V fill:#000000,color:#fff
    style SA fill:#333333,color:#fff
    style PG fill:#336791,color:#fff
    style RT fill:#336791,color:#fff
    style AUTH fill:#336791,color:#fff
```

### 9.1 Environment Variables

```bash
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database URLs (CRITICAL: Separate pooler from direct)
# DATABASE_URL: Transaction pooler for Server Actions (port 6543)
DATABASE_URL=postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# DIRECT_URL: Direct connection for Prisma migrations only (port 5432)
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

---

## 10. Scalability Considerations

| Component | Current Scale | Path to Scale |
|-----------|---------------|---------------|
| Frontend | Vercel free tier | Auto-scales |
| Database | Supabase free tier | Upgrade to Pro |
| Realtime | Supabase free tier (200 concurrent) | Upgrade for more |
| Auth | Supabase Auth (stateless) | Scales automatically |

**Key Difference from Express Path:**
- No need to manage WebSocket server scaling
- No Redis cluster setup needed
- Single JWT source for all services
- TanStack Query handles cache consistency

---

## 11. Comparison: All Three Paths

| Aspect | Path A (Express) | Path B (NextAuth) | **Path C (Fixed)** |
|--------|------------------|-------------------|-------------------|
| Backend | Express + Socket.IO | Server Actions | Server Actions |
| Auth | Custom JWT | NextAuth | **Supabase Auth** |
| Realtime | Socket.IO + Redis | Supabase | **Supabase** |
| State | Manual | useOptimistic | **TanStack Query** |
| RLS Support | ❌ Custom | ❌ JWT mismatch | ✅ **Native** |
| Lines of code | ~3500 | ~2000 | **~2200** |
| DevOps complexity | High | Low | **Low** |
| Bug risk | Medium | **High** (auth gap) | **Low** |

---

## 12. When to Choose Each Path

**Choose Path A (Express)** if:
- You want to learn Redis, Socket.IO, custom auth deeply
- You need to deploy backend independently of Vercel

**Choose Path B (NextAuth)** if:
- You need multiple OAuth providers not supported by Supabase
- You're okay with auth complexity and JWT mismatches

**Choose Path C (Fixed - Supabase Auth)** if:
- ✅ You want a working MVP quickly
- ✅ You want RLS to work seamlessly
- ✅ You want Realtime security to work
- ✅ You're okay with Supabase vendor lock-in

---

## 13. Key Fixes Summary

| Issue | Fix | Impact |
|-------|-----|--------|
| Auth Mismatch | Use Supabase Auth instead of NextAuth | RLS + Realtime work natively |
| Missing Join Data | Invalidate Query on event, refetch with joins | No UI crashes, complete data |
| Connection Exhaustion | Use pooler for DATABASE_URL, direct for migrations | Serverless won't crash |
| Manual State Management | TanStack Query instead of useOptimistic | Automatic rollback, sync, caching |
