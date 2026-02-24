/**
 * Not Found Page
 *
 * Displayed when a route is not found.
 * Uses Vercel-inspired design system with theme variables for dark mode support.
 * NOTE: not-found.tsx must be a Server Component — no 'use client' allowed.
 */

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-16">
      {/* Subtle grid background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.4]" />

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <Card className="border-border">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-6xl font-semibold text-foreground tracking-tight-vercel">
              404
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-lg text-foreground mb-2">
              Page not found
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/">Back Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
