/**
 * Logout API Route
 *
 * Handles user logout via Supabase Auth.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // For form submissions, we redirect
  // For fetch calls, the caller should handle redirect
  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect('/login');
}
