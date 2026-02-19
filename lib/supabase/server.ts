/**
 * Supabase Server Client
 *
 * Use this in Server Components and Server Actions.
 * Uses @supabase/ssr for proper cookie handling.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
}

/**
 * Get the current authenticated user from Supabase Auth.
 * Returns null if not authenticated.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authentication - throws or redirects if not authenticated.
 * Use in Server Actions that need authenticated users.
 */
export async function requireAuth() {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return user;
}

/**
 * Create a Supabase client with service role privileges.
 *
 * This client bypasses Row Level Security (RLS) policies and should ONLY be used for:
 * - Webhook handlers (GitHub, etc.)
 * - Background jobs and scheduled tasks
 * - System-level operations that don't have a user context
 *
 * NEVER use this in routes that handle authenticated user requests.
 * NEVER expose this client to client-side code.
 */
export async function createServiceRoleClient() {
  const { env } = await import('@/lib/env');

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {
          // No-op for service role
        },
        remove() {
          // No-op for service role
        },
      },
    }
  );
}
