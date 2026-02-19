/**
 * Root Error Page
 *
 * This file is used by Next.js App Router to handle errors that occur
 * in the root layout or during server-side rendering.
 *
 * It replaces the entire root layout when an error occurs.
 *
 * Note: This error.tsx does not catch errors thrown in layout.tsx itself.
 * For errors in layout.tsx, use the global-error.tsx file.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root Error Component
 *
 * Displays when an uncaught error occurs in the application.
 * Provides options to retry the action or navigate to the home page.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Root error boundary caught an error:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Logo / Branding */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl font-bold">
            TF
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription className="text-base">
              We encountered an unexpected error while processing your request.
              Our team has been notified and we are working to fix the issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Message</AlertTitle>
              <AlertDescription>
                {error.message || 'An unknown error occurred'}
                {error.digest && (
                  <span className="ml-2 text-xs opacity-70">
                    (ID: {error.digest})
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {isDevelopment && (
              <details className="rounded-lg border bg-muted p-4">
                <summary className="cursor-pointer font-medium text-sm">
                  Stack Trace (Development Only)
                </summary>
                <pre className="mt-4 overflow-auto rounded bg-background p-4 text-xs text-muted-foreground">
                  {error.stack}
                </pre>
              </details>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="outline"
              onClick={reset}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Need help?{' '}
          <a
            href="https://github.com/taskflow/taskflow/issues"
            className="text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report an issue
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Error Boundary Configuration
 *
 * Set the desired runtime for error pages.
 * Defaults to 'edge' for faster static error pages.
 */
export const runtime = 'nodejs';
