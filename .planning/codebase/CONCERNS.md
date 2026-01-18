# Codebase Concerns

**Analysis Date:** 2026-01-18

## Tech Debt

**OAuth Providers Not Configured:**
- Issue: Google and GitHub OAuth code is implemented but providers are not enabled in Supabase Dashboard
- Files: `frontend/app/auth/callback/route.ts`, `frontend/app/login/components/OAuthButtons.tsx`, `frontend/docs/TODO-OAuth-Setup.md`
- Impact: OAuth buttons will not function; users cannot sign in with Google/GitHub
- Fix approach: Follow steps in `frontend/docs/TODO-OAuth-Setup.md` to enable providers and configure redirect URLs

**Duplicate Client-Side Supabase Instance Export:**
- Issue: `frontend/lib/supabase/client.ts` exports both `createClient()` function AND `supabase` singleton at module level (line 30)
- Files: `frontend/lib/supabase/client.ts`
- Impact: The `supabase` export at module level may cause issues since `process.env` variables are not yet initialized during module evaluation in some contexts; also promotes direct usage instead of the function
- Fix approach: Remove the `export const supabase = createClient();` export; force consumers to use `createClient()` function

**Date Serialization Workaround in Server Components:**
- Issue: Server Components manually serialize Prisma Date objects to ISO strings (lines 36-41 in `frontend/app/dashboard/page.tsx`)
- Files: `frontend/app/dashboard/page.tsx`, `frontend/app/tasks/[id]/page.tsx`
- Impact: Type mismatch between Prisma Date and expected string types; requires manual serialization in every data-fetching component
- Fix approach: Create a utility function or Prisma extension for automatic date serialization; or use JSON serialization transforms

**Inconsistent Error Response Formats:**
- Issue: Some endpoints return `{ error: string }` while others return `{ success: false, error: string }`
- Files: `frontend/app/api/auth/login/route.ts` (returns `{ error }`), `frontend/app/api/tasks/create/route.ts` (returns `{ success: true, data }`)
- Impact: Client-side code must handle multiple response formats; inconsistent error handling
- Fix approach: Standardize all API responses to use `ApiResponse<T>` type from `frontend/lib/types/index.ts`

## Known Bugs

**Realtime Subscription on Every Component Mount:**
- Symptoms: Each client component that uses `useRealtimeTasks` or creates its own channel creates duplicate Supabase realtime subscriptions
- Files: `frontend/app/dashboard/components/TaskTable.tsx` (lines 84-101), `frontend/lib/hooks/useRealtimeTasks.ts`
- Trigger: Mounting multiple components or hot-reload during development
- Workaround: Use the `useRealtimeTasks` hook consistently instead of creating inline subscriptions
- Fix approach: The `useRealtimeTasks` hook exists but `TaskTable` creates its own subscription inline; migrate all components to use the centralized hook

**Logout Implementation Uses Client-Side Navigation:**
- Symptoms: Logout in `frontend/app/dashboard/page.tsx` uses a simple `<a>` tag (line 53) instead of proper server-side logout
- Files: `frontend/app/dashboard/page.tsx` (line 52-56)
- Trigger: User clicks "Sign out" link
- Workaround: Works but may not properly clear Supabase session cookies
- Fix approach: Use a Server Action or call `supabase.auth.signOut()` client-side before navigation

## Security Considerations

**OAuth Callback Error Handling Leaks Information:**
- Risk: OAuth callback redirects with `?error=auth-code-error` in URL (line 70 in `frontend/app/auth/callback/route.ts`)
- Files: `frontend/app/auth/callback/route.ts`
- Impact: Error messages visible in URL bar and browser history; potential information disclosure
- Current mitigation: Generic error messages only
- Recommendations: Use server-side session flash or server-side rendered error state instead of URL parameters

**dangerouslySetInnerHTML for OAuth Icons:**
- Risk: OAuth buttons use `dangerouslySetInnerHTML` to render SVG icons (line 63 in `frontend/app/login/components/OAuthButtons.tsx`)
- Files: `frontend/app/login/components/OAuthButtons.tsx`
- Impact: Potential XSS if icon strings are modified dynamically (currently static, so low risk)
- Current mitigation: Icons are static template literals
- Recommendations: Convert SVGs to proper React components or use an icon library

**Missing Rate Limiting:**
- Risk: No rate limiting on authentication endpoints (login, register) or API routes
- Files: `frontend/app/api/auth/login/route.ts`, `frontend/app/api/auth/register/route.ts`
- Impact: Vulnerable to credential stuffing and enumeration attacks
- Current mitigation: None
- Recommendations: Implement rate limiting using Vercel's edge config or middleware-based rate limiting

**No CSRF Token Validation on API Routes:**
- Risk: API routes use POST/DELETE without explicit CSRF token validation
- Files: All API routes under `frontend/app/api/`
- Impact: Relies on Supabase's built-in CSRF protection (SameSite cookies)
- Current mitigation: Supabase SSR handles CSRF for auth; API routes rely on Supabase session validation
- Recommendations: For non-mutation endpoints, ensure Supabase session check is sufficient; consider adding CSRF tokens for extra protection

**Environment Variable Validation Missing:**
- Risk: `process.env.NEXT_PUBLIC_SUPABASE_URL` and other env vars use non-null assertion (`!`) without validation at startup
- Files: `frontend/lib/supabase/server.ts`, `frontend/lib/supabase/client.ts`, `frontend/middleware.ts`, `frontend/app/auth/callback/route.ts`
- Impact: Application crashes at runtime if environment variables are missing
- Current mitigation: TypeScript `!` assertion bypasses compile-time checks
- Recommendations: Add environment variable validation using Zod or similar at application startup

## Performance Bottlenecks

**N+1 Query Pattern in Dashboard:**
- Problem: Dashboard fetches tasks but each task's events may trigger separate queries if accessed
- Files: `frontend/app/dashboard/page.tsx`
- Cause: Prisma `include` pattern is used correctly, but events are not included in dashboard query; task detail page fetches events separately
- Impact: Minimal for small datasets; degrades with many tasks
- Improvement path: Dashboard query already optimized; task detail query includes events; consider pagination for large datasets

**No Query Result Pagination:**
- Problem: `frontend/app/api/queries/tasks/route.ts` fetches all tasks without pagination
- Files: `frontend/app/api/queries/tasks/route.ts`, `frontend/app/api/notifications/route.ts`
- Impact: Performance degrades linearly with task/notification count; large responses slow down client
- Improvement path: Implement cursor-based or offset-based pagination using Prisma's `cursor()` or `skip`/`take`

**Realtime Invalidates All Tasks on Any Change:**
- Problem: Any task change triggers full task list refetch via `invalidateQueries({ queryKey: ['tasks'] })`
- Files: `frontend/app/dashboard/components/TaskTable.tsx` (line 94), `frontend/lib/hooks/useRealtimeTasks.ts` (line 33)
- Impact: Unnecessary data transfer when user only needs to see a single task update
- Improvement path: Use `setQueryData` to optimistically update specific task in cache; only refetch on complex changes

**No Static Asset Optimization Configuration:**
- Problem: Next.js config is minimal (12 lines in `frontend/next.config.ts`)
- Files: `frontend/next.config.ts`
- Cause: Early stage project
- Impact: Default Next.js optimization is good, but image optimization and bundle splitting configuration may be needed as project grows
- Improvement path: Configure `next.config.ts` with experimental features, image domains, and bundle splitting when needed

## Fragile Areas

**Authentication State Synchronization:**
- Files: `frontend/lib/hooks/useSession.ts`, `frontend/lib/supabase/server.ts`, `frontend/middleware.ts`
- Why fragile: Auth state exists in three places - Supabase cookies, client-side session, and server-side user lookup; must stay synchronized
- Safe modification: Always use `getAuthUser()` or `requireAuth()` from `frontend/lib/supabase/server.ts` for server-side; use `useSession()` hook for client
- Test coverage: No automated tests; manual testing only

**Realtime Subscription Lifecycle:**
- Files: `frontend/lib/hooks/useRealtimeTasks.ts`, `frontend/app/dashboard/components/TaskTable.tsx`
- Why fragile: Subscriptions must be properly cleaned up on unmount; duplicate subscriptions cause duplicate updates; Supabase channel names must be unique
- Safe modification: Use the centralized `useRealtimeTasks` hook; ensure cleanup function returns `() => supabase.removeChannel(channel)`
- Test coverage: No automated tests for subscription lifecycle

**Environment Configuration (DATABASE_URL vs DIRECT_URL):**
- Files: `frontend/.env.example`, `frontend/prisma/schema.prisma`, `frontend/lib/prisma.ts`
- Why fragile: Using wrong connection string causes connection exhaustion (pooler) or migration failures (direct)
- Safe modification: Always use `DATABASE_URL` (pooler, port 6543) for app code; only use `DIRECT_URL` (direct, port 5432) for `prisma db push`/migrate
- Test coverage: Documented in comments; no runtime validation

**Type Synchronization Between Prisma and Application Types:**
- Files: `frontend/lib/types/index.ts`, `frontend/prisma/schema.prisma`
- Why fragile: Manual type definitions in `lib/types/index.ts` must match Prisma schema; changes to schema require manual type updates
- Safe modification: Run `npx prisma generate` after schema changes; manually sync types in `lib/types/index.ts`
- Test coverage: TypeScript compilation (`tsc --noEmit`) catches some mismatches

## Scaling Limits

**Supabase Realtime Concurrent Connection Limit:**
- Current capacity: Free tier allows ~200 concurrent WebSocket connections
- Limit: Each browser tab opens one connection; multiple tabs per user count separately
- Scaling path: Upgrade to Supabase Pro tier for higher limits; consider connection pooling for enterprise scale

**Database Connection Pool Size:**
- Current capacity: Supabase free tier provides 60 transaction pooler connections
- Limit: Serverless functions (Vercel) can spawn many concurrent instances; pooler prevents exhaustion but queue times increase with load
- Scaling path: Monitor connection pool metrics; upgrade to Pro tier for more connections; implement connection caching if needed

**TanStack Query Cache Growth:**
- Current capacity: No cache size limits configured; infinite growth possible
- Limit: Browser memory grows with cached data over time
- Scaling path: Configure `cacheTime` (GC time) and implement cache size limits in QueryClient setup (`frontend/app/providers.tsx`)

## Dependencies at Risk

**Supabase Vendor Lock-in:**
- Risk: Deep integration with Supabase Auth, Database, and Realtime; difficult to migrate to alternative providers
- Impact: Migration would require rewriting auth layer, database access, and realtime infrastructure
- Migration plan: Abstract database operations behind repository interface; use standard OAuth providers; consider implementing dual-write strategy for migration

**Next.js 15 and React 19 Bleeding Edge:**
- Risk: Using latest major versions; ecosystem libraries may not have full compatibility
- Impact: Some third-party libraries may have bugs or missing features
- Migration plan: Monitor Next.js/React issue trackers; pin versions for stability; downgrade to stable versions if critical issues arise

**@supabase/ssr Complexity:**
- Risk: Server-side rendering client requires careful cookie handling; async/await patterns for Next.js 15
- Impact: Middleware and server components must follow exact patterns; easy to introduce bugs
- Migration plan: Document patterns rigorously; consider moving to purely client-side auth if SSR complexity becomes unmaintainable

## Missing Critical Features

**Test Coverage:**
- Problem: No test files found in project (no `*.test.ts` or `*.spec.ts` files)
- What's missing: Unit tests for API routes, component tests for React components, integration tests for auth flow
- Blocks: Confidence in refactoring; detection of regressions
- Priority: High - add test framework (Vitest) and critical path tests before adding more features

**Notification UI:**
- Problem: Notification API exists but no UI components to display notifications to users
- What's missing: Toast notifications, notification bell icon, notification center page
- Blocks: User awareness of task assignments and changes
- Priority: Medium - backend is complete, only frontend implementation needed

**Task Filtering and Search:**
- Problem: No UI for filtering tasks by status, priority, or assignee; no search functionality
- What's missing: Filter controls in dashboard, search input
- Blocks: Usability with large numbers of tasks
- Priority: Medium - can workaround for now; needed before scaling to many users

**User Profile Management:**
- Problem: Users cannot edit their profiles; no user settings page
- What's missing: Profile edit page, avatar upload, notification preferences
- Blocks: User customization
- Priority: Low - email/password auth works without profiles

**Task Comments Feature:**
- Problem: Task collaboration limited to status changes; no discussion thread
- What's missing: Comments table, comment API, comment UI components
- Blocks: Rich collaboration on tasks
- Priority: Low - tasks can be assigned and completed without comments

**File Attachments:**
- Problem: No way to attach files to tasks
- What's missing: File upload API, storage integration, file display components
- Blocks: Task documentation and collaboration
- Priority: Low - core task management works without attachments

## Test Coverage Gaps

**No Automated Tests:**
- What's not tested: All functionality - API routes, auth flows, component rendering, database queries
- Files: Entire `frontend/app/` directory
- Risk: Any change can break existing functionality; refactoring is unsafe
- Priority: High

**Missing Integration Tests:**
- What's not tested: End-to-end flows like registration -> login -> create task -> assign -> status update
- Files: Auth flow across `frontend/app/api/auth/`, `frontend/app/login/`, `frontend/app/dashboard/`
- Risk: Multi-step workflows may break with changes to individual components
- Priority: High

**No Realtime Subscription Tests:**
- What's not tested: Supabase realtime subscriptions, query invalidation on events, Fetch-on-Event pattern
- Files: `frontend/lib/hooks/useRealtimeTasks.ts`, `frontend/app/dashboard/components/TaskTable.tsx`
- Risk: Realtime updates may fail silently; users won't see changes from other users
- Priority: Medium

**Missing Auth Boundary Tests:**
- What's not tested: Protected routes redirect unauthenticated users; RLS policies enforce data isolation
- Files: `frontend/middleware.ts`, `frontend/lib/supabase/server.ts`
- Risk: Unauthorized users may access protected data or pages
- Priority: High (security critical)

---

*Concerns audit: 2026-01-18*
