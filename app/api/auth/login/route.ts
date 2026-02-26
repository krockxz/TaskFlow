/**
 * Login API Route
 *
 * Handles user authentication with Supabase Auth.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { unauthorized, validationError, badRequest, serverError } from '@/lib/api/errors';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return unauthorized(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const handled = error && typeof error === 'object' && 'name' in error && error.name === 'ZodError'
      ? validationError(error as z.ZodError)
      : null;

    if (handled) return handled;

    return serverError();
  }
}
