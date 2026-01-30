'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CommandAction } from '@/lib/types';

interface CommandContextValue {
  registerAction: (action: CommandAction) => () => void;
  unregisterAction: (id: string) => void;
  actions: CommandAction[];
}

const CommandContext = createContext<CommandContextValue | undefined>(undefined);

export function useCommand() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommand must be used within a CommandProvider');
  }
  return context;
}

interface CommandProviderProps {
  children: ReactNode;
}

export function CommandProvider({ children }: CommandProviderProps) {
  const [actions, setActions] = useState<CommandAction[]>([]);

  const registerAction = useCallback((action: CommandAction) => {
    setActions((prev) => {
      // Check for duplicate IDs and replace if exists
      const exists = prev.some((a) => a.id === action.id);
      if (exists) {
        return prev.map((a) => (a.id === action.id ? action : a));
      }
      return [...prev, action];
    });

    // Return cleanup function
    return () => {
      setActions((prev) => prev.filter((a) => a.id !== action.id));
    };
  }, []);

  const unregisterAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <CommandContext.Provider value={{ actions, registerAction, unregisterAction }}>
      {children}
    </CommandContext.Provider>
  );
}
