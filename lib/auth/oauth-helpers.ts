/**
 * Shared OAuth authentication helpers
 */

import { createClient } from '@/lib/supabase/client';
import type { Provider } from '@supabase/supabase-js';

export type OAuthProvider = 'github';

interface AuthOptions {
  redirectTo?: string;
}

type AuthResult = { error: string | null };

function buildRedirectUrl(redirectTo?: string): string {
  const baseUrl = `${window.location.origin}/auth/callback`;
  return redirectTo
    ? `${baseUrl}?next=${encodeURIComponent(redirectTo)}`
    : baseUrl;
}

export async function signInWithOAuth(
  provider: OAuthProvider,
  options: AuthOptions = {}
): Promise<AuthResult> {
  const { error } = await createClient().auth.signInWithOAuth({
    provider: provider as Provider,
    options: { redirectTo: buildRedirectUrl(options.redirectTo) },
  });

  if (error) {
    console.error(`Error signing in with ${provider}:`, error);
    return { error: error.message };
  }
  return { error: null };
}

export async function signInWithMagicLink(
  email: string,
  options: AuthOptions = {}
): Promise<AuthResult> {
  const { error } = await createClient().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: buildRedirectUrl(options.redirectTo) },
  });

  return error ? { error: error.message } : { error: null };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await createClient().auth.signOut();
  return error ? { error: error.message } : { error: null };
}
