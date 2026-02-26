/**
 * UnifiedHeader Component
 *
 * Consolidates AppHeader and Header into a single component with variant props.
 * Supports both pill-shaped navbar (app) and full-width header (dashboard) styles.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github, LogOut, ArrowLeft, Keyboard, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { useSignOut } from '@/lib/auth/sign-out';
import { useSession } from '@/lib/hooks/useSession';
import { cn } from '@/lib/utils';

type HeaderVariant = 'app' | 'dashboard';

interface LogoProps {
  href: string;
}

function Logo({ href }: LogoProps) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <div className="relative w-7 h-7 rounded-lg overflow-hidden">
        <Image
          src="/logo.jpg"
          alt="TaskFlow"
          width={28}
          height={28}
          className="object-cover w-full h-full"
        />
      </div>
      <span className="font-mono-display text-base font-semibold tracking-tight">
        TaskFlow
      </span>
    </Link>
  );
}

export interface UnifiedHeaderProps {
  /**
   * Visual style variant
   * - 'app': Pill-shaped navbar (landing page, marketing)
   * - 'dashboard': Full-width header (authenticated pages)
   */
  variant?: HeaderVariant;
  /**
   * User email (required for dashboard variant when user data not available from session)
   */
  userEmail?: string;
  /**
   * Page title (dashboard variant only)
   */
  title?: string;
  /**
   * Page description (dashboard variant only)
   */
  description?: string;
  /**
   * Actions to display on the right side (dashboard variant only)
   */
  actions?: React.ReactNode;
  /**
   * Back navigation link (dashboard variant only)
   */
  backTo?: string;
  /**
   * Back button label (dashboard variant only)
   */
  backLabel?: string;
}

export function UnifiedHeader({
  variant = 'app',
  userEmail,
  title,
  description,
  actions,
  backTo,
  backLabel = 'Back to Dashboard',
}: UnifiedHeaderProps) {
  const { handleSignOut, isPending } = useSignOut();
  const { user, isAuthenticated, isLoading } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await handleSignOut();
  };

  // APP VARIANT: Pill-shaped navbar
  if (variant === 'app') {
    if (isLoading) {
      return (
        <nav className="fixed top-6 left-0 right-0 z-50 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="h-12 rounded-full border border-border/40 bg-background/70 backdrop-blur-xl flex items-center px-4">
              <Logo href={isAuthenticated ? '/dashboard' : '/'} />
            </div>
          </div>
        </nav>
      );
    }

    return (
      <nav className="fixed top-6 left-0 right-0 z-50 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="h-12 rounded-full border border-border/40 bg-background/70 backdrop-blur-xl flex items-center justify-between px-2 sm:px-3">
            <Logo href={isAuthenticated ? '/dashboard' : '/'} />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  <ThemeToggle />
                  <NotificationBell />
                  <div className="h-4 w-px bg-border/30 mx-1" />
                  <button
                    onClick={handleLogout}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-50"
                    title="Sign out"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <span className="hidden lg:inline font-medium">Sign out</span>
                        <LogOut className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="https://github.com/krockxz/TaskFlow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <ThemeToggle />
                  <div className="h-4 w-px bg-border/30 mx-1" />
                  <Link href="/login">
                    <Button
                      size="sm"
                      className="h-8 px-4 rounded-full text-xs font-medium bg-foreground hover:bg-foreground/90 text-background"
                    >
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={mobileOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileOpen ? (
                  <span className="block w-4 h-4 relative">
                    <span className="absolute top-1/2 left-0 w-4 h-px bg-current -translate-y-1/2 rotate-45" />
                    <span className="absolute top-1/2 left-0 w-4 h-px bg-current -translate-y-1/2 -rotate-45" />
                  </span>
                ) : (
                  <span className="block w-4 h-4 relative">
                    <span className="absolute top-0 left-0 w-4 h-px bg-current" />
                    <span className="absolute top-1/2 left-0 w-4 h-px bg-current -translate-y-1/2" />
                    <span className="absolute bottom-0 left-0 w-4 h-px bg-current" />
                  </span>
                )}
              </motion.div>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden mt-2 max-w-2xl mx-auto"
              >
                <div className="rounded-2xl border border-border/40 bg-background/90 backdrop-blur-xl shadow-xl p-2">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-foreground/5 transition-colors">
                        <span className="text-sm text-muted-foreground">Theme</span>
                        <ThemeToggle />
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-foreground/05 transition-colors">
                        <span className="text-sm text-muted-foreground">Notifications</span>
                        <NotificationBell />
                      </div>
                      <div className="h-px bg-border/30 my-2" />
                      <div className="px-2.5 py-2 text-xs text-muted-foreground truncate">
                        {user?.email}
                      </div>
                      <button
                        onClick={handleLogout}
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-50"
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <a
                        href="https://github.com/krockxz/TaskFlow"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-xl text-foreground hover:bg-foreground/05 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Github className="w-4 h-4" />
                        <span className="text-sm">GitHub</span>
                      </a>
                      <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-foreground/05 transition-colors">
                        <span className="text-sm text-muted-foreground">Theme</span>
                        <ThemeToggle />
                      </div>
                      <div className="h-px bg-border/30 my-2" />
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="block">
                        <Button className="w-full h-10 rounded-xl text-sm bg-foreground hover:bg-foreground/90 text-background">
                          Get started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    );
  }

  // DASHBOARD VARIANT: Full-width header
  return (
    <header className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {backTo && (
              <Link href={backTo} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
            )}
            <div>
              {title ? (
                <>
                  <h1 className="text-xl font-semibold">{title}</h1>
                  {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </>
              ) : (
                <Link href="/dashboard" className="text-xl font-semibold hover:text-muted-foreground transition-colors">
                  TaskFlow
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Command palette hint */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
              <Keyboard className="h-3 w-3" />
              <span>⌘K</span>
            </div>
            {actions}
            {actions && <div className="h-6 w-px bg-border" />}
            <NotificationBell />
            <div className="h-6 w-px bg-border" />
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {userEmail || user?.email}
            </span>
            <LoadingButton
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              loading={isPending}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </LoadingButton>
          </div>
        </div>
      </div>
    </header>
  );
}

export default UnifiedHeader;
