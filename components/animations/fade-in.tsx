/**
 * FadeIn Animation Component
 *
 * Wraps children in a fade-in animation with stagger support for lists.
 * Great for page transitions and smooth content loading.
 */

'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { EASING, STAGGER, ANIMATION_DURATION } from '@/lib/constants/animations';

export interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  staggerChildren?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  duration = ANIMATION_DURATION.SLOW / 1000,
  className = '',
  staggerChildren = false,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: EASING.DEFAULT,
        staggerChildren: staggerChildren ? STAGGER.NORMAL : 0,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
