/**
 * Root Layout
 *
 * The main layout wrapper for the entire application.
 * Includes QueryProvider and global styles.
 */

import { Providers } from './providers';
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
      <body className="min-h-screen bg-gray-50 antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
