/**
 * useSession Hook
 *
 * Client-side hook for accessing the current Supabase session.
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error getting session:', err);
        setError(err);
        setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}
