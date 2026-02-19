/**
 * FloatingElement - Floating/pulsing animation component
 *
 * Creates subtle floating animations for decorative elements.
 * Supports continuous floating, pulsing scale, and hover effects.
 */

'use client';

import { motion } from 'motion/react';
import { ReactNode, HTMLAttributes } from 'react';

// Event handlers that conflict with Framer Motion
type ConflictingEventHandlers =
  | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'onDragEnter' | 'onDragExit' | 'onDragOver' | 'onDrop'
  | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
  | 'onTransitionStart' | 'onTransitionEnd' | 'onTransitionCancel';

export interface FloatingElementProps extends Omit<HTMLAttributes<HTMLDivElement>, ConflictingEventHandlers | 'onChange'> {
  children: ReactNode;
  /**
   * Float animation type
   * @default 'gentle'
   */
  floatType?: 'gentle' | 'bounce' | 'pulse' | 'none';
  /**
   * Float duration in seconds
   * @default 3
   */
  duration?: number;
  /**
   * Float distance (pixels)
   * @default 10
   */
  distance?: number;
  /**
   * Pulse scale (for 'pulse' type)
   * @default 1.05
   */
  pulseScale?: number;
  /**
   * Whether to pause animation on hover
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Hover scale effect
   * @default 1.02
   */
  hoverScale?: number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Use inline element instead of div
   */
  inline?: boolean;
  /**
   * Initial delay before animation starts
   * @default 0
   */
  delay?: number;
  /**
   * Whether animation should loop infinitely
   * @default true
   */
  repeat?: boolean;
}

const floatAnimations = {
  gentle: {
    y: [0, -10, 0] as const,
  },
  bounce: {
    y: [0, -15, 0, -5, 0] as const,
  },
  pulse: {
    scale: [1, 1.05, 1] as const,
  },
  none: {} as Record<string, never>,
};

export function FloatingElement({
  children,
  floatType = 'gentle',
  duration = 3,
  distance = 10,
  pulseScale = 1.05,
  pauseOnHover = true,
  hoverScale = 1.02,
  className = '',
  inline = false,
  delay = 0,
  repeat = true,
  ...props
}: FloatingElementProps) {
  const MotionComponent = inline ? motion.span : motion.div;

  // Adjust float distance based on type
  const getAnimation = () => {
    if (floatType === 'gentle') {
      return {
        y: [0, -distance, 0] as unknown as number[],
      };
    }
    if (floatType === 'bounce') {
      return {
        y: [0, -distance * 1.5, 0, -distance * 0.5, 0] as unknown as number[],
      };
    }
    if (floatType === 'pulse') {
      return {
        scale: [1, pulseScale, 1] as unknown as number[],
      };
    }
    return {};
  };

  const animation = getAnimation();

  return (
    <MotionComponent
      className={className}
      animate={animation}
      transition={{
        duration,
        repeat: repeat ? Infinity : 0,
        repeatType: 'reverse' as const,
        delay,
        ease: 'easeInOut',
      }}
      whileHover={pauseOnHover ? { scale: hoverScale } : undefined}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * PulsingDot - A small pulsing indicator dot
 *
 * Useful for showing live status, notifications, or active states.
 */
export interface PulsingDotProps {
  /**
   * Dot color class
   * @default 'bg-foreground'
   */
  color?: string;
  /**
   * Dot size in pixels
   * @default 8
   */
  size?: number;
  /**
   * Pulse duration in seconds
   * @default 2
   */
  duration?: number;
  /**
   * Whether to show ripple effect
   * @default true
   */
  ripple?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

export function PulsingDot({
  color = 'bg-foreground',
  size = 8,
  duration = 2,
  ripple = true,
  className = '',
}: PulsingDotProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Main dot */}
      <motion.div
        className={`absolute inset-0 rounded-full ${color}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Ripple effect */}
      {ripple && (
        <motion.div
          className={`absolute inset-0 rounded-full ${color}`}
          animate={{
            scale: [1, 2, 2],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}

/**
 * ShimmerEffect - Loading shimmer animation
 *
 * Creates a sliding gradient shimmer effect for loading states.
 */
export interface ShimmerEffectProps {
  /**
   * Width of the shimmer element
   * @default '100%'
   */
  width?: string | number;
  /**
   * Height of the shimmer element
   * @default '100%'
   */
  height?: string | number;
  /**
   * Rounded corners
   * @default 'rounded-md'
   */
  rounded?: string;
  /**
   * Additional className
   */
  className?: string;
}

export function ShimmerEffect({
  width = '100%',
  height = '100%',
  rounded = 'rounded-md',
  className = '',
}: ShimmerEffectProps) {
  return (
    <motion.div
      className={`bg-secondary/50 ${rounded} overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
        animate={{
          x: ['-100%', '100%'] as const,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}
