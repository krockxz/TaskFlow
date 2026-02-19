/**
 * useToast Hook
 *
 * Provides toast notification functionality with support for
 * success, error, warning, and info variants.
 * Uses React Context for state management across the app.
 */

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, variant?: ToastVariant, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'default', title?: string, duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, variant, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      toast(message, 'success', title);
    },
    [toast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      toast(message, 'error', title);
    },
    [toast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      toast(message, 'warning', title);
    },
    [toast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      toast(message, 'info', title);
    },
    [toast]
  );

  const value: ToastContextValue = {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
