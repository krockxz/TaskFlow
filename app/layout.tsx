/**
 * Root Layout
 *
 * The main layout wrapper for the entire application.
 * Includes Providers, Command Palette, and global styles.
 * AppHeader is only included in the landing page layout.
 */

import { Providers } from './providers';
import TaskFlowCommandPalette from '@/components/ui/command-palette';
import { CommandProvider } from '@/components/command/CommandContext';
import './globals.css';

export const metadata = {
  title: 'TaskFlow - Async Team Coordination',
  description: 'Simple task management and notifications for remote teams',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning>
        <CommandProvider>
          <Providers>
            <TaskFlowCommandPalette />
            {children}
          </Providers>
        </CommandProvider>
      </body>
    </html>
  );
}
