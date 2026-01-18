# External Integrations

**Analysis Date:** 2025-01-18

## APIs & External Services

**Authentication Providers:**
- Google OAuth - OAuth login
  - SDK/Client: `@supabase/ssr` (signInWithOAuth)
  - Config: Supabase Dashboard (Authentication > Providers > Google)
  - Code: `frontend/app/login/components/OAuthButtons.tsx`
  - Callback: `frontend/app/auth/callback/route.ts`

- GitHub OAuth - OAuth login
  - SDK/Client: `@supabase/ssr` (signInWithOAuth)
  - Config: Supabase Dashboard (Authentication > Providers > GitHub)
  - Code: `frontend/app/login/components/OAuthButtons.tsx`
  - Callback: `frontend/app/auth/callback/route.ts`

**Note:** OAuth secrets are stored in Supabase Dashboard, not as environment variables.

## Data Storage

**Databases:**
- Supabase PostgreSQL (project: `egitynomcplkkichnzju`)
  - Region: ap-south-1 (Mumbai)
  - Connection URLs:
    - Transaction Pooler: `DATABASE_URL` (port 6543) - for Server Actions, API routes, app queries
    - Direct Connection: `DIRECT_URL` (port 5432) - for Prisma migrations only
  - Client: Prisma ORM (`frontend/lib/prisma.ts`)
  - Schema: `frontend/prisma/schema.prisma`

**Tables:**
- `users` - User profiles (references Supabase Auth users)
- `tasks` - Tasks with status, priority, assignments
- `task_events` - Audit trail for task changes
- `notifications` - User notifications

**File Storage:**
- None (local filesystem only)

**Caching:**
- TanStack Query in-memory cache (30 minute garbage collection)
  - Config: `frontend/app/providers.tsx`
  - Stale time: 5 seconds
  - gcTime: 30 minutes

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (native)
  - Implementation:
    - Server client: `frontend/lib/supabase/server.ts` (createClient, getAuthUser, requireAuth)
    - Browser client: `frontend/lib/supabase/client.ts` (singleton pattern)
    - Middleware: `frontend/middleware.ts` (route protection, session refresh)

**Supported Methods:**
- Email/password authentication
  - Register: `frontend/app/api/auth/register/route.ts`
  - Login: `frontend/app/api/auth/login/route.ts`
  - Logout: `frontend/app/api/auth/logout/route.ts`
- Google OAuth (pending Supabase configuration)
- GitHub OAuth (pending Supabase configuration)

**OAuth Setup:**
- Status: Code complete, Supabase configuration pending
- See: `frontend/docs/TODO-OAuth-Setup.md`

## Monitoring & Observability

**Error Tracking:**
- None (console.error only)

**Logs:**
- Approach: Console logging
- Prisma query logging in development mode: `frontend/lib/prisma.ts`
- Supabase realtime connection logging: `frontend/lib/hooks/useRealtimeTasks.ts`

## CI/CD & Deployment

**Hosting:**
- Vercel (recommended deployment target for Next.js)

**CI Pipeline:**
- None configured

## Environment Configuration

**Required env vars:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://egitynomcplkkichnzju.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (CRITICAL: Separate pooler from direct)
DATABASE_URL=postgresql://postgres...pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres...supabase.co:5432/postgres

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Secrets location:**
- Supabase Dashboard for OAuth provider secrets
- `.env.local` for database URLs (gitignored)
- Template: `.env.example`

## Webhooks & Callbacks

**Incoming:**
- `/auth/callback` - OAuth callback from Google/GitHub
  - Handler: `frontend/app/auth/callback/route.ts`
  - Exchanges auth code for session
  - Syncs user to Prisma via upsert

**Outgoing:**
- None (no webhooks sent to external services)

## Realtime Subscriptions

**Supabase Realtime:**
- Table: `tasks`
- Channel: `tasks-realtime`
- Handler: `frontend/lib/hooks/useRealtimeTasks.ts`
- Pattern: Fetch-on-Event (invalidate queries on change, don't push payloads directly)

---

*Integration audit: 2025-01-18*
