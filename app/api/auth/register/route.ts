/**
 * Register API Route
 *
 * Handles new user registration with Supabase Auth
 * and creates corresponding User record in database.
 */

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validationError, badRequest, serverError } from '@/lib/api/errors';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = registerSchema.parse(body);

    const supabase = await createClient();

    // Create user in Supabase Auth
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !user) {
      return badRequest(error?.message || 'Registration failed');
    }

    // Create corresponding user record in our database
    try {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
        },
      });
    } catch (dbError) {
      // If user already exists in database, that's okay
      // (they might have been created via trigger or previous signup)
      console.error('Error creating user record:', dbError);
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
