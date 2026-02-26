/**
 * LoadingButton Component
 *
 * Button component with built-in loading state.
 * Shows a spinner icon when loading and disables the button.
 */

'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean;
  /**
   * Text to show when loading (optional, defaults to hiding children)
   */
  loadingText?: React.ReactNode;
  /**
   * Whether to hide children when loading (default: true)
   */
  hideChildrenWhenLoading?: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      loading = false,
      loadingText,
      hideChildrenWhenLoading = true,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={cn('gap-2', className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading || !hideChildrenWhenLoading ? (
          <>
            {loading && loadingText ? loadingText : children}
          </>
        ) : (
          loadingText || children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
