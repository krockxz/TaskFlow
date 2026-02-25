/**
 * Auth Callback Route
 *
 * Handles OAuth callbacks from Google, GitHub, and other providers.
 * Exchanges the auth code for a session and syncs the user to Prisma.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
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

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync user to Prisma database
      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.email) {
        try {
          // Only create user if they don't exist - skip update to avoid slow writes
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                id: user.id,
                email: user.email,
              },
            });
          }
        } catch (dbError) {
          console.error('Error syncing user to Prisma:', dbError);
        }
      }

      // Redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error on failure
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
