# Codebase Structure

**Analysis Date:** 2025-01-18

## Directory Layout

```
Loop/
├── frontend/                 # Next.js application (monorepo root)
│   ├── app/                  # Next.js App Router pages and layouts
│   │   ├── api/             # API routes (mutations and queries)
│   │   ├── auth/            # OAuth callback handler
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── login/           # Login page with OAuth
│   │   ├── register/        # Registration page
│   │   └── tasks/           # Task pages (list, detail, new)
│   ├── components/          # React components
│   │   ├── layout/          # Layout components (empty, for future use)
│   │   └── ui/              # Reusable UI components (empty, for future use)
│   ├── lib/                 # Utilities and configurations
│   │   ├── hooks/           # Custom React hooks
│   │   ├── supabase/        # Supabase client factories
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # Utility functions (empty, for future use)
│   ├── prisma/              # Prisma ORM files
│   └── public/              # Static assets
├── .planning/               # Planning and codebase analysis documents
└── docs/                    # Project documentation
```

## Directory Purposes

**`frontend/app/`:**
- Purpose: Next.js App Router pages, layouts, and API routes
- Contains: Page components (Server Components), API route handlers
- Key files: `layout.tsx`, `page.tsx`, `providers.tsx`, `globals.css`

**`frontend/app/api/`:**
- Purpose: HTTP API endpoints for mutations and queries
- Contains: RESTful route handlers organized by resource
- Key subdirectories:
  - `auth/` - Authentication endpoints (`login`, `register`, `logout`)
  - `tasks/` - Task CRUD operations (`create`, `[id]`, `update-status`, `update-priority`, `reassign`)
  - `notifications/` - Notification queries and updates
  - `queries/` - Read-only query endpoints (e.g., `tasks`)
  - `users/` - User listing endpoint

**`frontend/app/dashboard/`:**
- Purpose: Main dashboard page showing user's tasks
- Contains: Server Component page, Client Components for interactivity
- Key files: `page.tsx`, `components/TaskTable.tsx`, `components/NewTaskButton.tsx`

**`frontend/app/tasks/`:**
- Purpose: Task-related pages (new task form, task details)
- Contains: Dynamic route `[id]` for individual tasks
- Key files: `new/page.tsx`, `[id]/page.tsx`

**`frontend/components/`:**
- Purpose: Shared React components
- Contains: Currently empty subdirectories for future organization
- Note: Most components are currently co-located with their pages

**`frontend/lib/`:**
- Purpose: Core library code and utilities
- Contains: Supabase clients, Prisma singleton, types, hooks

**`frontend/lib/supabase/`:**
- Purpose: Supabase client factories for server and client
- Key files: `server.ts`, `client.ts`

**`frontend/lib/hooks/`:**
- Purpose: Custom React hooks
- Key files: `useSession.ts`, `useRealtimeTasks.ts`

**`frontend/lib/types/`:**
- Purpose: Shared TypeScript type definitions
- Key files: `index.ts`

**`frontend/prisma/`:**
- Purpose: Database schema and migrations
- Key files: `schema.prisma`

## Key File Locations

**Entry Points:**
- `frontend/app/layout.tsx`: Root layout with Providers wrapper
- `frontend/app/page.tsx`: Root page redirect
- `frontend/middleware.ts`: Route protection and auth redirects
- `frontend/app/providers.tsx`: TanStack Query provider setup

**Configuration:**
- `frontend/package.json`: Dependencies and scripts
- `frontend/tsconfig.json`: TypeScript configuration with `@/*` path alias
- `frontend/next.config.ts`: Next.js configuration (server actions, react strict mode)
- `frontend/.env.example`: Environment variable template
- `frontend/tailwind.config.ts`: Tailwind CSS configuration

**Core Logic:**
- `frontend/lib/prisma.ts`: Prisma client singleton
- `frontend/lib/supabase/server.ts`: Server-side Supabase client
- `frontend/lib/supabase/client.ts`: Client-side Supabase client
- `frontend/lib/types/index.ts`: All shared types
- `frontend/prisma/schema.prisma`: Database schema

**Authentication:**
- `frontend/app/login/page.tsx`: Login page
- `frontend/app/login/components/AuthForm.tsx`: Email/password form
- `frontend/app/login/components/OAuthButtons.tsx`: Google/GitHub OAuth buttons
- `frontend/app/auth/callback/route.ts`: OAuth callback handler
- `frontend/app/api/auth/login/route.ts`: Login API
- `frontend/app/api/auth/register/route.ts`: Registration API
- `frontend/app/api/auth/logout/route.ts`: Logout API

**Task Management:**
- `frontend/app/dashboard/page.tsx`: Dashboard with task list
- `frontend/app/dashboard/components/TaskTable.tsx`: Task table with realtime updates
- `frontend/app/tasks/new/page.tsx`: New task form page
- `frontend/app/tasks/new/components/TaskForm.tsx`: Task creation form
- `frontend/app/tasks/[id]/page.tsx`: Task detail page
- `frontend/app/tasks/[id]/components/TaskDetail.tsx`: Task detail component

**API Routes:**
- `frontend/app/api/queries/tasks/route.ts`: Get user's tasks (read-only)
- `frontend/app/api/tasks/create/route.ts`: Create new task
- `frontend/app/api/tasks/[id]/route.ts`: Get single task
- `frontend/app/api/tasks/update-status/route.ts`: Update task status
- `frontend/app/api/tasks/update-priority/route.ts`: Update task priority
- `frontend/app/api/tasks/reassign/route.ts`: Reassign task to different user
- `frontend/app/api/notifications/route.ts`: Get user notifications
- `frontend/app/api/notifications/mark-read/route.ts`: Mark notification as read
- `frontend/app/api/notifications/unread-count/route.ts`: Get unread notification count
- `frontend/app/api/users/route.ts`: List all users

**Testing:**
- Not currently implemented

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `TaskTable.tsx`, `AuthForm.tsx`)
- Utilities/libraries: `kebab-case.ts` (e.g., `use-session.ts` in lib/hooks)
- Pages: `page.tsx` (App Router convention)
- Layouts: `layout.tsx` (App Router convention)
- API routes: `route.ts` (App Router convention)

**Directories:**
- Pages/features: `kebab-case` (e.g., `dashboard`, `tasks`, `login`)
- Dynamic routes: `[param-name]` (e.g., `[id]`)
- API routes: Resource-based `kebab-case` (e.g., `update-status`, `mark-read`)

**Functions/Variables:**
- camelCase (e.g., `createClient`, `getAuthUser`, `useSession`)

**Types/Interfaces:**
- PascalCase (e.g., `Task`, `UserPreview`, `ApiResponse`)

**Constants:**
- UPPER_SNAKE_CASE for enum values (e.g., `OPEN`, `IN_PROGRESS`, `LOW`, `MEDIUM`)
- camelCase for exported objects (e.g., `queryKeys`)

## Where to Add New Code

**New Feature (pages + API):**
- Primary code: `frontend/app/{feature-name}/page.tsx`
- API routes: `frontend/app/api/{resource}/{action}/route.ts`
- Components: `frontend/app/{feature-name}/components/` or `frontend/components/`

**New API Endpoint:**
- Mutations: `frontend/app/api/{resource}/{action}/route.ts`
- Queries: `frontend/app/api/queries/{resource}/route.ts`
- Always add: Zod validation schema, auth check with `getAuthUser()`

**New Component/Module:**
- Shared reusable: `frontend/components/ui/{ComponentName}.tsx`
- Page-specific: Co-locate in `frontend/app/{page}/components/`
- Always add: `'use client'` directive if using hooks/interactivity

**Utilities:**
- Shared helpers: `frontend/lib/utils/{name}.ts`
- Custom hooks: `frontend/lib/hooks/use{Name}.ts`
- Supabase helpers: Add to existing files in `frontend/lib/supabase/`

**Types:**
- Add to: `frontend/lib/types/index.ts`
- Include related query keys in `queryKeys` object

**Database Changes:**
- Schema: Update `frontend/prisma/schema.prisma`
- Migrate: Run `npm run db:push` (development) or generate migration
- Regenerate client: Run `npm run db:generate`

## Special Directories

**`frontend/.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No (in .gitignore)

**`frontend/node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No (in .gitignore)

**`frontend/components/layout/`:**
- Purpose: Layout components (header, footer, navigation)
- Generated: No
- Committed: Yes
- Currently empty

**`frontend/components/ui/`:**
- Purpose: Reusable UI components (buttons, inputs, cards)
- Generated: No
- Committed: Yes
- Currently empty (using CSS classes in globals.css instead)

**`frontend/lib/utils/`:**
- Purpose: Utility functions
- Generated: No
- Committed: Yes
- Currently empty

---

*Structure analysis: 2025-01-18*
