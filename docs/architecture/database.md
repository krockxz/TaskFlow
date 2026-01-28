# Database Design - TaskFlow (Supabase + Fixed)

## 1. Overview

TaskFlow uses Supabase (PostgreSQL) with Prisma ORM. The schema supports task management, audit trails, notifications, and Supabase Auth (native).

---

## 2. Entity Relationship Diagram

```mermaid
erDiagram
    SUPABASE_USER ||--o{ TASKS : creates
    SUPABASE_USER ||--o{ TASKS : assigned_to
    SUPABASE_USER ||--o{ TASK_EVENTS : creates
    SUPABASE_USER ||--o{ NOTIFICATIONS : receives
    TASKS ||--o{ TASK_EVENTS : has
    TASKS ||--o{ NOTIFICATIONS : generates

    SUPABASE_USER {
        uuid id PK
        string email UK
        string password
        timestamp created_at
        timestamp updated_at
    }

    TASKS {
        uuid id PK
        string title
        text description
        string status
        string priority
        uuid created_by FK
        uuid assigned_to FK
        timestamp created_at
        timestamp updated_at
    }

    TASK_EVENTS {
        uuid id PK
        uuid task_id FK
        string event_type
        string old_status
        string new_status
        uuid changed_by FK
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        uuid task_id FK
        text message
        boolean read
        timestamp created_at
    }
```

---

## 3. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // CRITICAL: For migrations only
}

// ============================================================================
// SUPABASE AUTH MODELS (Managed by Supabase - don't modify)
// ============================================================================

// Note: When using Supabase Auth, these tables are managed automatically
// You can extend them but should use Supabase migrations for auth tables

// ============================================================================
// TASKFLOW MODELS
// ============================================================================

model Task {
  id          String      @id @default(uuid())
  title       String
  description String?     @db.Text
  status      TaskStatus  @default(OPEN)
  priority    TaskPriority @default(MEDIUM)

  // Foreign keys
  createdById String
  assignedTo  String?

  // Relations
  createdBy   User         @relation("CreatedBy", fields: [createdById], references: [id])
  assignedToUser User?     @relation("AssignedTo", fields: [assignedTo], references: [id])
  events      TaskEvent[]
  notifications Notification[]

  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  @@index([assignedTo])
  @@index([status])
  @@index([createdById])
  @@map("tasks")
}

model TaskEvent {
  id        String   @id @default(uuid())
  taskId    String
  eventType EventType

  oldStatus String?  @map("old_status")
  newStatus String?  @map("new_status")

  changedById String
  changedBy   User    @relation(fields: [changedById], references: [id])

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([changedById])
  @@map("task_events")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  taskId    String

  message   String   @db.Text
  read      Boolean  @default(false)

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@index([createdAt])
  @@map("notifications")
}

// ============================================================================
// USER MODEL (References Supabase Auth users)
// ============================================================================

model User {
  id            String    @id // Matches Supabase Auth user.id
  email         String    @unique
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  createdTasks  Task      @relation("CreatedBy")
  assignedTasks Task      @relation("AssignedTo")
  createdEvents TaskEvent[]
  notifications Notification[]

  @@map("users")
}

// ============================================================================
// ENUMS
// ============================================================================

enum TaskStatus {
  OPEN
  IN_PROGRESS
  READY_FOR_REVIEW
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

enum EventType {
  CREATED
  ASSIGNED
  STATUS_CHANGED
  COMPLETED
  PRIORITY_CHANGED
}
```

---

## 4. Connection Pooling (CRITICAL FIX)

### 4.1 The Problem

Server Actions run in serverless functions. Each invocation creates a new database connection. Without pooling, you'll hit Supabase's connection limit quickly.

### 4.2 The Solution: Two Separate URLs

```bash
# .env.local

# DATABASE_URL: Transaction Pooler (port 6543)
# Used by: Prisma Client in Server Actions
# Why: Handles many short-lived connections from serverless functions
DATABASE_URL=postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# DIRECT_URL: Direct Connection (port 5432)
# Used by: Prisma Migrations (prisma migrate push/reset)
# Why: Migrations need a stable, long-lived connection
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4.3 URL Comparison

| Property | DATABASE_URL (Pooler) | DIRECT_URL |
|-----------|----------------------|------------|
| Port | 6543 | 5432 |
| Host | `aws-0-[region].pooler.supabase.com` | `db.[ref].supabase.co` |
| Username | `postgres.[project_id]` | `postgres` |
| Used For | **Server Actions**, App Queries | Migrations only |
| Connection Type | Pgbouncer (Transaction mode) | Direct PostgreSQL |
| Max Connections | Higher (pooler manages) | Lower (direct limit) |

### 4.4 Getting These URLs from Supabase

1. Go to **Supabase Dashboard** → Your Project
2. **Settings** → **Database**
3. Scroll to **Connection String** section

**For Transaction Pooler (DATABASE_URL):**
- Select **Transaction mode**
- Copy the URL (replace `[YOUR-PASSWORD]` with your actual password)
- Port will be `:6543`

**For Direct (DIRECT_URL):**
- Select **Session mode**
- Copy the URL
- Port will be `:5432`

---

## 5. Supabase Realtime Setup

### 5.1 Enable Realtime on Tables

In Supabase Dashboard → **Database** → **Replication**:

```sql
-- Enable realtime for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Optionally enable for task_events (for activity feed)
ALTER PUBLICATION supabase_realtime ADD TABLE task_events;
```

### 5.2 Row Level Security (RLS) Policies for Database Access

With Supabase Auth, RLS works natively using `auth.uid()`:

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_events ENABLE ROW LEVEL SECURITY;

-- Tasks: Users can see tasks they created or are assigned to
CREATE POLICY "Users can view their tasks"
ON tasks FOR SELECT
USING (
  auth.uid()::text = created_by OR
  auth.uid()::text = assigned_to
);

CREATE POLICY "Users can insert tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update their tasks"
ON tasks FOR UPDATE
USING (
  auth.uid()::text = created_by OR
  auth.uid()::text = assigned_to
);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view their notifications"
ON notifications FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their notifications"
ON notifications FOR UPDATE
USING (auth.uid()::text = user_id);

-- Task events: Readable by task participants
CREATE POLICY "Users can view events for their tasks"
ON task_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_events.task_id
    AND (auth.uid()::text = tasks.created_by OR auth.uid()::text = tasks.assigned_to)
  )
);
```

### 5.3 Realtime RLS Policies (CRITICAL for Subscriptions)

**Supabase Realtime also requires RLS policies for WebSocket subscriptions.** Without these, users won't receive realtime updates even if database RLS works.

```sql
-- ============================================================================
-- REALTIME RLS POLICIES
-- These policies control what users can receive via WebSocket subscriptions
-- ============================================================================

-- Tasks Realtime: Users can subscribe to tasks they created or are assigned to
CREATE POLICY "Realtime: Users can subscribe to their tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  auth.uid()::text = created_by OR
  auth.uid()::text = assigned_to
);

-- Notifications Realtime: Users can subscribe to their own notifications
CREATE POLICY "Realtime: Users can subscribe to their notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Task Events Realtime: Users can subscribe to events for their tasks
CREATE POLICY "Realtime: Users can subscribe to their task events"
ON task_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_events.task_id
    AND (auth.uid()::text = tasks.created_by OR auth.uid()::text = tasks.assigned_to)
  )
);
```

**Why Both Database and Realtime Policies?**

| Policy Type | Purpose | Example |
|-------------|---------|---------|
| Database RLS | Controls SQL query access | `SELECT * FROM tasks` |
| Realtime RLS | Controls WebSocket subscription access | `supabase.channel('tasks').on(...)` |

Without Realtime RLS policies, the WebSocket connection will fail or return no data even if the user has database access.

### 5.4 Realtime Error Handling in Client Code

```typescript
// lib/supabase/realtime-handler.ts
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionOptions {
  channel: string;
  table: string;
  filter?: string;
  onEvent: (payload: any) => void;
  onError?: (error: Error) => void;
}

export function subscribeToRealtime({
  channel,
  table,
  filter,
  onEvent,
  onError,
}: SubscriptionOptions): RealtimeChannel {
  const supabase = createClient();

  const realtimeChannel = supabase
    .channel(channel)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
      },
      (payload) => {
        try {
          onEvent(payload);
        } catch (error) {
          console.error('Error handling realtime event:', error);
          onError?.(error as Error);
        }
      }
    )
    .subscribe((status) => {
      // Handle subscription status changes
      if (status === 'SUBSCRIBED') {
        console.log(`Connected to realtime channel: ${channel}`);
      } else if (status === 'CLOSED') {
        console.warn(`Realtime channel closed: ${channel}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Realtime channel error: ${channel}`);
        onError?.(new Error(`Realtime subscription failed: ${channel}`));
      }
    });

  return realtimeChannel;
}

// Usage in component
// biome-ignore format: complex hook
useEffect(() => {
  const channel = subscribeToRealtime({
    channel: 'tasks-changes',
    table: 'tasks',
    onEvent: (payload) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      // Show toast notification to user
      toast.error('Real-time updates unavailable. Refresh to see latest changes.');
    },
  });

  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase, queryClient]);
```

---

## 6. Indexes Explained

| Table | Index | Purpose | Query Type |
|-------|-------|---------|------------|
| `tasks` | `assignedTo` | Dashboard queries by assigned user | `WHERE assigned_to = ?` |
| `tasks` | `status` | Filter by status | `WHERE status = ?` |
| `tasks` | `createdById` | User's created tasks | `WHERE created_by = ?` |
| `task_events` | `taskId` | Event history for task | `WHERE task_id = ? ORDER BY created_at` |
| `task_events` | `changedById` | User's activity log | `WHERE changed_by = ?` |
| `notifications` | `userId + read` | Unread notification count | `WHERE user_id = ? AND read = false` |
| `notifications` | `createdAt` | Recent notifications list | `WHERE user_id = ? ORDER BY created_at DESC` |

---

## 7. Migration Strategy

### 7.1 Setup Commands

```bash
# Install dependencies
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# Push schema to Supabase (uses DIRECT_URL for schema changes)
npx prisma db push

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

### 7.2 Prisma Schema with Direct URL

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Required for migrations
}
```

---

## 8. Seed Data (Development)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Note: When using Supabase Auth, users are created via Supabase Auth
  // This seed assumes users exist or creates them without passwords

  const alice = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'alice@taskflow.dev',
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'bob@taskflow.dev',
    },
  });

  // Create sample tasks
  await prisma.task.create({
    data: {
      title: 'Design homepage mockup',
      description: 'Create initial wireframes for the new homepage design',
      status: TaskStatus.OPEN,
      priority: TaskPriority.HIGH,
      createdById: alice.id,
      assignedTo: bob.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Set up database schema',
      description: 'Define Prisma schema and run initial migrations',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      createdById: bob.id,
      assignedTo: bob.id,
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

---

## 9. Common Query Patterns

### 9.1 Get User's Dashboard Tasks

```typescript
async function getUserTasks(userId: string) {
  return prisma.task.findMany({
    where: {
      OR: [
        { assignedTo: userId },
        { createdById: userId },
      ],
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}
```

### 9.2 Get Task with Event History

```typescript
async function getTaskDetail(taskId: string) {
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

### 9.3 Get Unread Notifications

```typescript
async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    include: {
      task: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}
```

### 9.4 Create Task with Notification (Transaction)

```typescript
async function createTaskWithNotification(
  data: CreateTaskInput,
  creatorId: string
) {
  return prisma.$transaction(async (tx) => {
    // Create task
    const task = await tx.task.create({
      data: {
        ...data,
        createdById: creatorId,
      },
    });

    // Create event
    await tx.taskEvent.create({
      data: {
        taskId: task.id,
        eventType: 'CREATED',
        newStatus: task.status,
        changedById: creatorId,
      },
    });

    // Create notification for assignee
    if (data.assignedTo && data.assignedTo !== creatorId) {
      await tx.notification.create({
        data: {
          userId: data.assignedTo,
          taskId: task.id,
          message: `You have been assigned a new task: ${task.title}`,
        },
      });
    }

    return task;
  });
}
```

---

## 10. Prisma Client Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
```

---

## 11. Environment Setup

### 11.1 Supabase Project Setup

1. Go to [supabase.com](https://supabase.com)
2. Create new project (free tier)
3. Get credentials from Settings → API
4. Enable Realtime for required tables

### 11.2 Environment Variables Template

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database URLs (CRITICAL: Separate pooler from direct)
# DATABASE_URL: Transaction pooler for Server Actions
# Format: postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
DATABASE_URL=postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# DIRECT_URL: Direct connection for Prisma migrations only
# Format: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

---

## 12. Data Access Patterns

| Access Method | Use Case | Example |
|---------------|----------|---------|
| Server Component | Initial page load, SSR | `prisma.task.findMany()` |
| Server Action | Mutations from forms | `createTask(formData)` |
| Supabase Client | Realtime subscriptions | `supabase.channel().on(...)` |
| TanStack Query | Client-side caching | `useQuery(['tasks'], fetchTasks)` |

---

## 13. Backup & Recovery

Supabase handles:
- **Daily backups** (retained 7 days on free tier)
- **Point-in-time recovery** (Pro tier)
- **Physical backups** downloadable anytime

Access: Dashboard → Database → Backups

---

## 14. Connection Pooling Deep Dive

### 14.1 Why Pooling Matters

```
Without Pooling (Direct Connection):
Server Action #1 → Opens DB connection → Closes
Server Action #2 → Opens DB connection → Closes
Server Action #3 → Opens DB connection → Closes
... × 100 concurrent users = 100 connections = HIT LIMIT

With Pooling (Pgbouncer):
Server Action #1 → Pool → DB (reuses connection)
Server Action #2 → Pool → DB (reuses connection)
Server Action #3 → Pool → DB (reuses connection)
... × 100 concurrent users = ~10 connections (pool manages) = SAFE
```

### 14.2 Transaction Mode vs Session Mode

| Mode | Best For | Connection Duration |
|------|----------|---------------------|
| **Transaction** (port 6543) | Serverless, Server Actions | Very short (per query) |
| Session (port 5432) | Long-running processes | Long (held open) |

**For Next.js Server Actions, always use Transaction mode.**

---

## 15. Troubleshooting Database Issues

### Issue: "Too many connections"

**Cause:** Using direct connection instead of pooler for DATABASE_URL.

**Fix:** Ensure DATABASE_URL uses port 6543 (pooler).

### Issue: "Migration failed"

**Cause:** Using pooler for migrations.

**Fix:** Ensure DIRECT_URL is set and points to port 5432.

### Issue: "relation does not exist"

**Cause:** Schema not pushed to database.

**Fix:** Run `npx prisma db push` to sync schema.
