/**
 * Supabase Server Client
 *
 * Use this in Server Components and Server Actions.
 * Uses @supabase/ssr for proper cookie handling.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
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
