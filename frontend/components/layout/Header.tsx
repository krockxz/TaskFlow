/**
 * Header Component
 *
 * Shared header component for authenticated pages.
 * Displays page title, user email, notification bell, and sign out button.
 * Accepts optional title, description, and actions for page-specific customization.
 */

'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * Header component properties.
 */
export interface HeaderProps {
  /**
   * User's email address to display.
   */
  userEmail: string;
  /**
   * Optional page title to display. If not provided, shows "TaskFlow" logo.
   */
  title?: string;
  /**
   * Optional page description to display below the title.
   */
  description?: string;
  /**
   * Optional actions to display in the header (e.g., NewTaskButton).
   */
  actions?: ReactNode;
}

/**
 * Header Component
 *
 * A reusable header component for authenticated pages. By default displays
 * the TaskFlow logo on the left. When title/description are provided, shows
 * those instead. Always displays notification bell, user email, and sign out
 * button on the right.
 *
 * @example
 * ```tsx
 * // Default header with TaskFlow logo
 * <Header userEmail={user.email} />
 *
 * // Page-specific header with title and actions
 * <Header
 *   userEmail={user.email}
 *   title="Dashboard"
 *   description="Manage your tasks"
 *   actions={<NewTaskButton />}
 * />
 * ```
 */
export function Header({ userEmail, title, description, actions }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side: Logo/title or page-specific title/description */}
          <div>
            {title ? (
              <>
                <h1 className="text-xl font-semibold">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </>
            ) : (
              <Link
                href="/dashboard"
                className="text-xl font-semibold hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                TaskFlow
              </Link>
            )}
          </div>

          {/* Right side: Actions, NotificationBell, user email, logout */}
          <div className="flex items-center gap-4">
            {actions}
            {actions && <Separator orientation="vertical" className="h-6" />}
            <NotificationBell />
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {userEmail}
            </span>
            <Button variant="ghost" size="sm" asChild>
              <a href="/api/auth/logout">Sign out</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
