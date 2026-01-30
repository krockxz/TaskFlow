/**
 * Global Command Actions
 *
 * Registers global command palette actions for navigation and theme.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Home, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useCommand } from './CommandProvider';
import { useEffect } from 'react';
import type { CommandAction } from '@/lib/types';

export function useGlobalActions() {
  const { registerAction } = useCommand();
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const globalActions: CommandAction[] = [
      {
        id: 'navigate-home',
        label: 'Go to Home',
        icon: Home,
        keywords: ['home', 'landing', 'start'],
        onSelect: () => router.push('/'),
        context: 'global',
      },
      {
        id: 'navigate-dashboard',
        label: 'Go to Dashboard',
        icon: LayoutDashboard,
        keywords: ['dashboard', 'tasks', 'list'],
        onSelect: () => router.push('/dashboard'),
        context: 'global',
      },
      {
        id: 'toggle-theme',
        label: 'Toggle Theme',
        icon: theme === 'dark' ? Sun : Moon,
        keywords: ['theme', 'dark', 'light', 'mode'],
        onSelect: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        context: 'global',
      },
    ];

    globalActions.forEach(registerAction);
  }, [registerAction, router, theme, setTheme]);
}
