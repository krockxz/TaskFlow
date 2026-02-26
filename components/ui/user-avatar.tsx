/**
 * UserAvatar Component
 *
 * Avatar component that automatically generates initials from email.
 * Reusable across the application for consistent user display.
 */

'use client';

import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface UserAvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  /**
   * User email to generate initials from
   */
  email: string;
  /**
   * Optional src for avatar image
   */
  src?: string;
  /**
   * Optional alt text for image
   */
  alt?: string;
  /**
   * Class name for the avatar container
   */
  className?: string;
  /**
   * Class name for the fallback (initials)
   */
  fallbackClassName?: string;
}

/**
 * Get initials from email address
 * - Takes the part before @
 * - Splits by . and takes first letter of each part
 * - Falls back to first 2 characters if no dots
 * - Returns uppercase, max 2 characters
 */
export function getInitials(email: string): string {
  if (!email) return '?';

  const localPart = email.split('@')[0];
  const parts = localPart.split('.');

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return localPart.substring(0, 2).toUpperCase();
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ email, src, alt, className, fallbackClassName, ...props }, ref) => {
    const initials = React.useMemo(() => getInitials(email), [email]);

    return (
      <Avatar ref={ref} className={className} {...props}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt || email} className="aspect-square h-full w-full" />
        ) : null}
        <AvatarFallback className={fallbackClassName}>
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';

export { UserAvatar };
