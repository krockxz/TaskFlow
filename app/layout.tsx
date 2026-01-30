/**
 * Root Layout
 *
 * The main layout wrapper for the entire application.
 * Includes AppHeader, Providers, Command Palette, and global styles.
 */

import { Providers } from './providers';
import { AppHeader } from '@/components/layout/AppHeader';
import TaskFlowCommandPalette from '@/components/ui/command-palette';
import './globals.css';

export const metadata = {
  title: 'TaskFlow - Async Team Coordination',
  description: 'Simple task management and notifications for remote teams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning>
        <Providers>
          <AppHeader />
          <TaskFlowCommandPalette />
          {children}
        </Providers>
      </body>
    </html>
  );
}
