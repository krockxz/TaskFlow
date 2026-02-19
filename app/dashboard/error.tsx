/**
 * Dashboard Error Page
 *
 * This file handles errors that occur within the dashboard route.
 * It preserves the dashboard layout while showing an error message.
 *
 * Error components must be Client Components because they use
 * React hooks like useEffect and useSearchParams.
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

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Dashboard Error Component
 *
 * Displays when an error occurs specifically within the dashboard section.
 * Shows a contextual error message with options to retry or return home.
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Dashboard error boundary caught an error:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Dashboard Error</CardTitle>
          <CardDescription>
            Something went wrong while loading your dashboard. This could be due to
            a network issue or a temporary server problem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>
              {error.message || 'Failed to load dashboard content'}
              {error.digest && (
                <span className="ml-2 text-xs opacity-70">
                  (ID: {error.digest})
                </span>
              )}
            </AlertDescription>
          </Alert>

          {isDevelopment && error.stack && (
            <details className="rounded-lg border bg-muted p-4">
              <summary className="cursor-pointer font-medium text-sm">
                Stack Trace (Dev Mode)
              </summary>
              <pre className="mt-4 max-h-64 overflow-auto rounded bg-background p-3 text-xs text-muted-foreground">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium">What you can try:</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Click &quot;Try Again&quot; to reload the dashboard</li>
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache and try again</li>
              <li>• Go back to the home page and navigate again</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </Link>
          <Button onClick={reset} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Error Boundary Configuration
 *
 * Set the desired runtime for error pages.
 */
export const runtime = 'nodejs';
