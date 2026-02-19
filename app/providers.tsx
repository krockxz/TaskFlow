/**
 * Providers Wrapper
 *
 * Wraps the app with all necessary providers:
 * - ThemeProvider (next-themes) for dark/light mode
 * - QueryClientProvider for server state management
 * - ToastProvider for toast notifications
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { ToastProvider, Toaster } from '@/components/toast/ToastProvider';

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient instance once and reuse
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data remains fresh for 5 seconds
            staleTime: 5000,
            // Cache data for 30 minutes (v5 uses gcTime instead of cacheTime)
            gcTime: 30 * 60 * 1000,
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations once
            retry: 1,
            // Mutation errors are thrown
            throwOnError: false,
          },
        },
      })
  );

  return (
    <ToastProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools
              initialIsOpen={false}
              position="bottom"
            />
          )}
        </QueryClientProvider>
      </ThemeProvider>
      <Toaster />
    </ToastProvider>
  );
}
