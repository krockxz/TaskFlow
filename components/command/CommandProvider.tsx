/**
 * Command Provider
 *
 * React Context provider for the command palette.
 * Manages command state and action registration.
 */

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CommandAction, CommandContextValue } from '@/lib/types';

const CommandContext = createContext<CommandContextValue | null>(null);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState<CommandAction[]>([]);

  const registerAction = useCallback((action: CommandAction) => {
    setActions((prev) => {
      // Check if action with same id exists
      if (prev.some((a) => a.id === action.id)) {
        return prev.map((a) => (a.id === action.id ? action : a));
      }
      return [...prev, action];
    });
  }, []);

  const unregisterAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <CommandContext value={{ isOpen, setIsOpen, actions, registerAction, unregisterAction }}>
      {children}
    </CommandContext>
  );
}

export function useCommand() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommand must be used within CommandProvider');
  }
  return context;
}
