# Coding Conventions

**Analysis Date:** 2025-01-18

## Naming Patterns

**Files:**
- `kebab-case.ts` for TypeScript files (e.g., `use-session.ts`, `task-form.tsx`)
- `kebab-case.tsx` for React components (e.g., `task-table.tsx`, `auth-form.tsx`)
- Directory-based routes using Next.js App Router (e.g., `app/tasks/[id]/page.tsx`)

**Functions/Methods:**
- `camelCase` for all functions (e.g., `createClient`, `getAuthUser`, `handleSubmit`)
- Async functions use `camelCase` with `async` keyword (e.g., `POST`, `GET` in route handlers)
- Hook functions prefixed with `use` (e.g., `useSession`, `useRealtimeTasks`)

**Variables:**
- `camelCase` for local variables (e.g., `isLoading`, `taskId`, `formData`)
- `UPPER_SNAKE_CASE` for constants (not heavily used, but appears in config values)

**Types/Interfaces:**
- `PascalCase` for all types and interfaces (e.g., `Task`, `CreateTaskInput`, `RouteContext`)
- `PascalCase` for React components (e.g., `TaskTable`, `AuthForm`, `OAuthButtons`)
- `PascalCase` for enum values (e.g., `OPEN`, `IN_PROGRESS`, `LOW`, `MEDIUM`)

**Type Discriminators:**
- Input types use `Input` suffix (e.g., `CreateTaskInput`, `LoginInput`, `RegisterInput`)
- Response types use `Response` suffix (e.g., `ApiResponse`, `ApiSuccessResponse`)
- Preview types use `Preview` suffix (e.g., `UserPreview`)

## Code Style

**Formatting:**
- **Tool:** ESLint with `next/core-web-vitals` preset
- **Config:** `.eslintrc.json` extends Next.js recommended rules
- No explicit Prettier config - relies on ESLint and editor defaults

**TypeScript Configuration:**
- `strict: true` enabled
- `forceConsistentCasingInFileNames: true`
- Path alias: `@/*` maps to project root
- Target: ES2022
- Module resolution: `bundler`

**Import Organization:**
1. External library imports (React, Next.js, third-party packages)
2. Internal imports with `@/` alias (components, lib, types)
3. Relative imports (rare, mostly for co-located components)

**Path Aliases:**
- `@/*` maps to project root (e.g., `@/lib/supabase/server`, `@/lib/types`)

**Import Style:**
```typescript
// External
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/ssr';

// Internal
import { Task } from '@/lib/types';
import prisma from '@/lib/prisma';
```

## Error Handling

**Patterns:**
- API routes return `NextResponse.json()` with appropriate status codes
- Success responses: `{ success: true, data: ... }` or just the data
- Error responses: `{ error: string }` or `{ success: false, error: string }`
- Zod validation errors include `fieldErrors` object

**API Response Shape:**
```typescript
// Success
NextResponse.json({ success: true, data: updated });

// Error
NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Validation Error
NextResponse.json(
  { error: 'Invalid input', fieldErrors: error.flatten().fieldErrors },
  { status: 400 }
);
```

**Validation:**
- Zod schemas for request validation in API routes
- Schema pattern: `const xSchema = z.object({ ... })`
- Parse with `.parse()` and catch `z.ZodError`

**Client-Side Error Handling:**
- `try/catch` in async functions
- State-based error display (e.g., `const [error, setError] = useState<string | null>(null)`)
- Error messages displayed to users in red bordered boxes

**Server-Side Error Handling:**
- Console.error logging for debugging
- Generic error messages in responses (avoid exposing internals)
- Early returns on authentication/authorization failures

## Logging

**Framework:** `console.log`, `console.error` (no structured logging library)

**Patterns:**
- `console.error()` for API route errors with context: `console.error('GET /api/tasks/[id] error:', error)`
- `console.log()` for realtime subscription confirmation: `console.log('Connected to Supabase realtime')`
- No production logging service configured

**When to Log:**
- API route errors (with route identifier)
- Realtime connection events
- OAuth errors during user sync

## Comments

**When to Comment:**
- File headers explaining purpose (all files have header comments)
- Complex pattern explanations (e.g., Fetch-on-Event pattern in `useRealtimeTasks.ts`)
- OAuth callback flow documentation
- Component prop interfaces

**JSDoc Style:**
- Block comments with `/**` for file headers
- Section dividers using `// ========` in larger files (e.g., `lib/types/index.ts`)
- Inline comments for complex logic

**Header Pattern:**
```typescript
/**
 * Component/Function Name
 *
 * Brief description of purpose.
 * Additional context if needed.
 */
```

**Section Dividers (in type files):**
```typescript
// ============================================================================
// TASK TYPES
// ============================================================================
```

## Function Design

**Size:**
- Most functions under 50 lines
- Route handlers typically 30-60 lines
- Components typically 80-150 lines (TaskTable is largest at 176 lines)

**Parameters:**
- Object destructuring for multiple parameters (e.g., `{ taskId, status }`)
- Type definitions for props using interfaces
- Request context typed with custom types (e.g., `RouteContext`)

**Return Values:**
- API routes return `NextResponse`
- Server actions can return data or redirect
- Async functions return typed promises
- Mutations in TanStack Query return typed data

## Module Design

**Exports:**
- Named exports for components and utilities
- Default exports for pages, layouts, and singleton instances
- Type-only exports when needed: `export type { ... }`

**Barrel Files:**
- `lib/types/index.ts` is the main type barrel
- `lib/supabase/` has separate client/server files (no barrel)
- `lib/hooks/` exports individual hooks

**Singleton Pattern:**
- `lib/prisma.ts` exports singleton Prisma client
- `lib/supabase/client.ts` exports singleton browser client

**Separation of Concerns:**
- Server client: `lib/supabase/server.ts`
- Browser client: `lib/supabase/client.ts`
- Types: `lib/types/index.ts`
- Hooks: `lib/hooks/`
- API routes: `app/api/`
- Page components: `app/` or co-located in `app/*/components/`

## Server vs Client Components

**Server Components (default):**
- No `'use client'` directive
- Pages in `app/*/page.tsx`
- Direct database access via Prisma
- Auth via `getAuthUser()`

**Client Components:**
- Explicit `'use client'` directive at top of file
- Interactive components (forms, dropdowns, realtime subscriptions)
- TanStack Query hooks
- Supabase browser client usage

## React Patterns

**State Management:**
- TanStack Query v5 for server state
- Local `useState` for form inputs and UI state
- `useSession` hook for auth state

**Realtime Subscriptions:**
- Fetch-on-Event pattern (invalidate queries, don't update directly)
- Cleanup in `useEffect` return

**Optimistic Updates:**
- Use `onMutate` in TanStack Query mutations
- Rollback on error with `onError`
- Refetch on settle with `onSettled`

## CSS/Tailwind Conventions

**Class Organization:**
- Utility classes from Tailwind CSS
- Custom component classes in `app/globals.css` (`.btn`, `.input`, `.card`)
- `@layer components` for reusable styles
- `@layer utilities` for custom utilities

**Common Classes:**
- `.btn` - Base button styles
- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary buttons
- `.input` - Form input fields
- `.card` - Content containers

**Accessibility:**
- `focus-visible` styles in `@layer base`
- Semantic HTML elements
- Proper label associations with `htmlFor`

---

*Convention analysis: 2025-01-18*
