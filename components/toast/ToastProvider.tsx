/**
 * ToastProvider Component
 *
 * Displays toast notifications in a fixed position at bottom-right.
 * Uses the existing SlideInToast component for animations.
 * Supports multiple stacked toasts with auto-dismiss.
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { ToastProvider as ToastProviderInner, useToast, type ToastVariant } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';

// Re-export ToastProvider from the hook
export { ToastProviderInner as ToastProvider };

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-background border-border text-foreground',
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: <AlertCircle className="h-5 w-5" />,
  success: <Check className="h-5 w-5" />,
  error: <X className="h-5 w-5" />,
  warning: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  toast: {
    id: string;
    variant: ToastVariant;
    title?: string;
    message: string;
  };
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-lg max-w-md',
        variantStyles[toast.variant]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {variantIcons[toast.variant]}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm">{toast.title}</p>
        )}
        <p className={cn('text-sm', toast.title && 'mt-1')}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
