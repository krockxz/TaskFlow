/**
 * Not Found Page
 *
 * Displayed when a route is not found.
 * Uses Vercel-inspired design system with theme variables for dark mode support.
 */

'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
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

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <Card className="border-border">
          <CardHeader className="space-y-2 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CardTitle className="text-6xl font-semibold text-foreground tracking-tight-vercel">
                404
              </CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent className="text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-foreground mb-2"
            >
              Page not found
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </motion.p>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full sm:w-auto"
            >
              <Button asChild className="w-full sm:w-auto">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full sm:w-auto"
            >
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/">Back Home</Link>
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
