# Technology Stack

**Analysis Date:** 2025-01-18

## Languages

**Primary:**
- TypeScript 5.x - All application code (`.ts`, `.tsx` files)

**Secondary:**
- PostgreSQL (SQL) - Database queries via Prisma ORM

## Runtime

**Environment:**
- Node.js >=20.0.0 (required engine)

**Package Manager:**
- npm (lockfile: `frontend/package-lock.json` present)

## Frameworks

**Core:**
- Next.js 15.1.6 - Full-stack React framework with App Router
- React 19.0.0 - UI library
- @supabase/ssr 0.6.1 - Server-side rendering utilities for Supabase

**State Management:**
- @tanstack/react-query 5.64.2 - Server state, caching, optimistic updates
- @tanstack/react-query-devtools 5.64.2 - DevTools for TanStack Query

**Database:**
- Prisma 6.1.0 - ORM for PostgreSQL type-safe database access
- @prisma/client 6.1.0 - Prisma client generator

**Validation:**
- Zod 3.24.1 - Runtime validation and type inference

**Styling:**
- TailwindCSS 3.4.17 - Utility-first CSS framework
- PostCSS 8.4.49 - CSS processing
- Autoprefixer 10.4.20 - CSS vendor prefixing

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.48.1 - Supabase client for database, auth, realtime
- @supabase/ssr 0.6.1 - Server-side rendering support for Supabase auth

**Infrastructure:**
- @types/node 22 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions

**Development:**
- TypeScript 5 - Type checking
- ESLint 9 - Linting
- eslint-config-next 15.1.6 - Next.js ESLint configuration

## Configuration

**Environment:**
- `.env.local` for local development (gitignored)
- `.env.example` for template (tracked)

**Required env vars:**
```bash
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anonymous key
DATABASE_URL                   # Transaction pooler (port 6543)
DIRECT_URL                     # Direct connection (port 5432)
NEXT_PUBLIC_APP_URL            # App URL (default: http://localhost:3000)
NODE_ENV                       # Environment (development/production)
```

**Build:**
- `frontend/next.config.ts` - Next.js configuration with Server Actions
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/tailwind.config.ts` - TailwindCSS configuration
- `frontend/postcss.config.mjs` - PostCSS configuration
- `frontend/.eslintrc.json` - ESLint configuration (extends `next/core-web-vitals`)
- `frontend/middleware.ts` - Next.js middleware for route protection

**Scripts:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

## Platform Requirements

**Development:**
- Node.js >=20.0.0
- npm (comes with Node.js)
- PostgreSQL database (via Supabase hosting)

**Production:**
- Vercel (recommended for Next.js deployment)
- Supabase project (database, auth, realtime)

**Database Schema:**
- `frontend/prisma/schema.prisma` - Prisma schema defining all models
- Models: Task, TaskEvent, Notification, User
- Enums: TaskStatus, TaskPriority, EventType

---

*Stack analysis: 2025-01-18*
