/**
 * Root Page
 *
 * Redirects to dashboard or login based on auth state.
 */

import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles the actual redirect
  // This is a fallback
  redirect('/dashboard');
}
