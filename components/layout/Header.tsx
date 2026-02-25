/**
 * Header Component
 *
 * Shared header for authenticated pages.
 * Displays page title, user email, notification bell, and sign out.
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { ReactNode } from 'react';
import { LogOut, Loader2, ArrowLeft, Keyboard } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signOut } from '@/lib/auth/oauth-helpers';

export interface HeaderProps {
  userEmail: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function Header({ userEmail, title, description, actions, backTo, backLabel = 'Back to Dashboard' }: HeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      startTransition(() => {
        router.push('/');
        router.refresh();
      });
    }
  };

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
            {actions && <Separator orientation="vertical" className="h-6" />}
            <NotificationBell />
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground hidden sm:inline-block">{userEmail}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
