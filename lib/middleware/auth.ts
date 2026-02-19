/**
 * Authentication Middleware Utilities
 *
 * Reusable authentication helpers for API routes.
 * These are re-exported from lib/supabase/server for consistency.
 *
 * All authentication logic should use the central auth module in lib/supabase/server.ts.
 */

// Re-export core auth functions from the central auth module
export { getAuthUser, requireAuth } from '@/lib/supabase/server';

import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { requireAuth as _requireAuth } from '@/lib/supabase/server';

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
      const user = await _requireAuth();
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
