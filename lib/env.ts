import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Environment variable validation schema.
 *
 * This module validates all required environment variables at application startup,
 * preventing cryptic "undefined" errors in production. Missing or invalid variables
 * will cause the application to fail immediately with clear, actionable error messages.
 *
 * @see https://env.t3.gg/docs/nextjs for more information
 */
export const env = createEnv({
  /**
   * Server-side environment variables.
   * These are NOT exposed to the browser and are only available on the server.
   */
  server: {
    /**
     * Node environment (development, production, or test).
     * Defaults to 'development' if not set.
     */
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    /**
     * Database connection string using the transaction pooler.
     *
     * IMPORTANT: This URL must use port 6543 (PgBouncer in Transaction mode).
     * Use this for: Server Actions, API routes, and all application queries.
     *
     * Format: postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
     */
    DATABASE_URL: z.string().url(),

    /**
     * Direct database connection string.
     *
     * IMPORTANT: This URL must use port 5432 (direct PostgreSQL connection).
     * Use this for: Prisma migrations ONLY (npx prisma db push/reset).
     *
     * Format: postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres
     */
    DIRECT_URL: z.string().url(),
  },

  /**
   * Client-side environment variables.
   * These are exposed to the browser and must start with NEXT_PUBLIC_.
   */
  client: {
    /**
     * Supabase project URL.
     * Get from: Supabase Dashboard → Settings → API
     *
     * Format: https://your-project.supabase.co
     */
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),

    /**
     * Supabase anonymous key.
     * Get from: Supabase Dashboard → Settings → API
     *
     * This key is safe to expose to the browser as it's subject to RLS policies.
     */
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

    /**
     * Application URL for production deployments.
     * Defaults to 'http://localhost:3000' if not set.
     *
     * Used for: OAuth redirects, email links, and absolute URL generation
     */
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  },

  /**
   * Runtime validation.
   *
   * When true, environment variables are validated on every access.
   * When false, validation happens once at module load time.
   *
   * We set this to false for better performance since we validate at startup.
   */
  runtimeEnv: {
    // Server variables
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,

    // Client variables (also available on server)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Called when validation fails.
   * Formats the error message for better readability.
   */
  onValidationError: (error) => {
    console.error('❌ Invalid environment variables:');
    for (const issue of error) {
      console.error(`  ${issue.path?.join('.') || 'unknown'}: ${issue.message}`);
    }
    throw new Error('Environment variables validation failed. See above for details.');
  },
});

/**
 * Type inference for environment variables.
 *
 * Use this type in your code for full type safety:
 *
 * ```ts
 * import { env } from '@/lib/env';
 *
 * const dbUrl: string = env.DATABASE_URL; // Fully typed
 * ```
 */
export type Env = typeof env;
