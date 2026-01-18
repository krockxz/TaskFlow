# Architecture

**Analysis Date:** 2025-01-18

## Pattern Overview

**Overall:** Next.js 15 App Router with Server-First Architecture

**Key Characteristics:**
- Server Components for data fetching and static content
- Client Components for interactivity (forms, realtime updates)
- Supabase for authentication, database, and realtime
- Prisma ORM for type-safe database access
- TanStack Query for server state management and optimistic UI
- Fetch-on-Event pattern for Supabase Realtime integration

## Layers

**Presentation Layer (App Router):**
- Purpose: UI rendering and user interactions
- Location: `frontend/app/`
- Contains: Page components, layouts, API routes
- Depends on: Database layer, Auth layer, State management
- Used by: End users

**Database Access Layer:**
- Purpose: Type-safe database queries and connection management
- Location: `frontend/lib/prisma.ts`, `frontend/prisma/schema.prisma`
- Contains: Prisma client singleton, schema definitions
- Depends on: PostgreSQL (Supabase)
- Used by: Server Components, API routes

**Authentication Layer:**
- Purpose: User authentication and session management
- Location: `frontend/lib/supabase/server.ts`, `frontend/lib/supabase/client.ts`
- Contains: Supabase client factories, auth helpers
- Depends on: Supabase Auth, Next.js cookies
- Used by: Middleware, Server Components, API routes

**State Management Layer:**
- Purpose: Client-side caching, optimistic updates, realtime subscriptions
- Location: `frontend/lib/hooks/`, `frontend/app/providers.tsx`
- Contains: Custom React hooks, TanStack Query provider
- Depends on: TanStack Query, Supabase Realtime
- Used by: Client Components

**Type System Layer:**
- Purpose: Shared TypeScript types and validation schemas
- Location: `frontend/lib/types/index.ts`
- Contains: Domain types, API response types, Query keys
- Depends on: None
- Used by: All layers

**API Layer:**
- Purpose: HTTP endpoints for mutations and queries
- Location: `frontend/app/api/`
- Contains: Route handlers for tasks, notifications, auth, users
- Depends on: Auth layer, Database layer
- Used by: Client Components

## Data Flow

**Authentication Flow:**

1. User visits login page (`/login`) - Server Component renders AuthForm
2. User submits credentials via API route (`/api/auth/login` or `/api/auth/register`)
3. Supabase Auth validates credentials and creates session cookie
4. Middleware validates session on protected routes
5. OAuth flow: User clicks OAuth button -> Supabase Auth page -> `/auth/callback` route syncs user to Prisma

**Task Creation Flow:**

1. Server Component (`/tasks/new`) fetches users via Prisma for dropdown
2. User fills TaskForm (Client Component) and submits
3. Form POSTs to `/api/tasks/create` with task data
4. API route validates with Zod, creates task via Prisma
5. Creates TaskEvent audit record
6. Creates notification for assignee (if assigned)
7. Returns success, client redirects to dashboard
8. TanStack Query invalidates tasks cache, triggering refetch

**Realtime Update Flow (Fetch-on-Event Pattern):**

1. Supabase Realtime detects database change on `tasks` table
2. Client receives postgres_changes event
3. Event triggers `queryClient.invalidateQueries({ queryKey: ['tasks'] })`
4. TanStack Query refetches from `/api/queries/tasks`
5. Fresh data includes all relations (createdBy, assignedToUser)

**State Management:**

- Server Components: Direct Prisma access, fresh data on each request
- Client Components: TanStack Query cache with optimistic updates
- Realtime: Event signals refetch, never direct payload update
- Auth: Supabase session stored in HTTP-only cookies

## Key Abstractions

**Supabase Server Client:**
- Purpose: Server-side authentication and cookie management
- Examples: `frontend/lib/supabase/server.ts`
- Pattern: Factory function creating server client with cookie store
- Usage: Server Components, API routes, middleware

**Supabase Browser Client:**
- Purpose: Client-side authentication and realtime subscriptions
- Examples: `frontend/lib/supabase/client.ts`
- Pattern: Singleton with lazy initialization
- Usage: Client Components, custom hooks

**Prisma Singleton:**
- Purpose: Prevent database connection exhaustion in development
- Examples: `frontend/lib/prisma.ts`
- Pattern: Global variable with hot-reload preservation
- Usage: All database queries

**TanStack Query Keys:**
- Purpose: Centralized query key definitions for cache invalidation
- Examples: `frontend/lib/types/index.ts` (queryKeys export)
- Pattern: Constant objects with tuple-based keys
- Usage: All useQuery/useMutation calls

## Entry Points

**Root Layout:**
- Location: `frontend/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Wraps app with Providers (TanStack Query), global styles

**Middleware:**
- Location: `frontend/middleware.ts`
- Triggers: Route transitions for protected/auth paths
- Responsibilities: Session validation, redirects for auth state

**Root Page:**
- Location: `frontend/app/page.tsx`
- Triggers: GET `/`
- Responsibilities: Redirects to dashboard (actual redirect happens in middleware)

**Providers Component:**
- Location: `frontend/app/providers.tsx`
- Triggers: App initialization
- Responsibilities: TanStack Query client configuration, devtools setup

**Auth Callback Route:**
- Location: `frontend/app/auth/callback/route.ts`
- Triggers: OAuth provider redirect
- Responsibilities: Exchange code for session, sync user to Prisma

## Error Handling

**Strategy:** Centralized error handling with user-friendly messages

**Patterns:**
- API routes: Try-catch with Zod validation, return JSON with error/status
- Mutations: onMutate optimistic update, onError rollback, onSettled refetch
- Auth: Supabase error messages passed through to client
- Not found: Next.js notFound() for unauthorized access to resources

**Response Format:**
```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string, fieldErrors?: Record<string, string[]> }
```

## Cross-Cutting Concerns

**Logging:**
- Server: Console.error in API routes, Prisma query logging in dev
- Client: Console.log for realtime subscription confirmation

**Validation:**
- Runtime: Zod schemas in API routes
- Type-level: TypeScript throughout
- Client-side: HTML5 validation attributes + controlled form state

**Authentication:**
- Middleware: Route protection based on session
- Server Components: getAuthUser() helper for access control
- API routes: getUser() check before processing requests
- RLS: Supabase Row Level Security (configured in Supabase dashboard)

**Authorization:**
- Task access: Users can only view tasks they created or are assigned to
- Implemented in: `frontend/app/tasks/[id]/page.tsx`

---

*Architecture analysis: 2025-01-18*
