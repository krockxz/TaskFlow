/**
 * Authentication Middleware Utilities
 *
 * Reusable authentication helpers for API routes.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * Authentication error class for throwing in protected routes.
 */
export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Require authentication for an API route.
 * Returns the authenticated user or throws AuthError.
 *
 * @example
 * ```ts
 * export async function GET(req: Request) {
 *   const user = await requireAuth();
 *   // user is guaranteed to be non-null here
 * }
 * ```
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError();
  }

  return user;
}

/**
 * Get the current user, returning null if not authenticated.
 *
 * @example
 * ```ts
 * export async function GET(req: Request) {
 *   const user = await getAuthUser();
 *   if (!user) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 * }
 * ```
 */
export async function getAuthUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Create a standard unauthorized response.
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Wrapper for API route handlers that require authentication.
 * Automatically handles auth check and returns 401 if unauthenticated.
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (req, user) => {
 *   // user is guaranteed to be non-null here
 *   return NextResponse.json({ data: '...' });
 * });
 * ```
 */
export function withAuth<T>(
  handler: (req: Request, user: User) => Promise<T> | T
): (req: Request) => Promise<NextResponse> {
  return async (req: Request) => {
    try {
      const user = await requireAuth();
      const result = await handler(req, user);
      return result as NextResponse;
    } catch (error) {
      if (error instanceof AuthError) {
        return unauthorizedResponse();
      }
      throw error;
    }
  };
}
