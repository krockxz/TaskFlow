/**
 * Centralized Sign-Out Utility
 *
 * Provides a consistent sign-out experience across the application.
 * Handles Supabase sign-out, toast notifications, and navigation.
 *
 * Call this from Client Components only (requires useRouter and useTransition).
 */

'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import { signOut as supabaseSignOut } from '@/lib/auth/oauth-helpers';

interface SignOutOptions {
  /**
   * Where to redirect after sign-out. Defaults to '/'.
   */
  redirectTo?: string;
  /**
   * Optional callback to execute after successful sign-out.
   * Useful for clearing component-specific state.
   */
  onSignOut?: () => void;
}

/**
 * Hook that returns a function to handle sign-out with consistent behavior.
 *
 * @example
 * ```tsx
 * const { handleSignOut, isPending } = useSignOut();
 *
 * <button onClick={handleSignOut} disabled={isPending}>
 *   Sign out
 * </button>
 * ```
 */
export function useSignOut() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  const handleSignOut = async (options: SignOutOptions = {}) => {
    const { redirectTo = '/', onSignOut } = options;

    const { error } = await supabaseSignOut();

    if (error) {
      toastError('Failed to sign out. Please try again.');
      return;
    }

    // Execute any cleanup callback provided by the component
    onSignOut?.();

    // Show success notification
    success('Signed out successfully');

    // Navigate using transition for smooth UX
    startTransition(() => {
      router.push(redirectTo);
      router.refresh();
    });
  };

  return { handleSignOut, isPending };
}

/**
 * Server Action for sign-out (for Server Components and Server Actions).
 * Does not include toast or router logic - use useSignOut in Client Components for full UX.
 *
 * @example
 * ```ts
 * import { signOutAction } from '@/lib/auth/sign-out';
 *
 * // In a Server Action or form handler
 * export async function logout() {
 *   const { error } = await signOutAction();
 *   if (error) {
 *     return { success: false, error };
 *   }
 *   return { success: true };
 * }
 * ```
 */
export async function signOutAction() {
  return supabaseSignOut();
}
