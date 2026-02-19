/**
 * ScrollReveal - Reusable scroll-triggered animation component
 *
 * Wraps children with fade-in and slide-up animation when they enter viewport.
 * Supports custom delays, directions, and animation variants.
 */

'use client';

import { motion, useInView, UseInViewOptions } from 'motion/react';
import { useRef, ReactNode } from 'react';

export interface ScrollRevealProps {
  children: ReactNode;
  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number;
  /**
   * Animation duration in seconds
   * @default 0.5
   */
  duration?: number;
  /**
   * Direction of slide animation
   * @default 'up'
   */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /**
   * Distance to slide (in pixels for x/y)
   * @default 30
   */
  distance?: number;
  /**
   * useInView options for controlling when animation triggers
   * @default { once: true, margin: '-50px' }
   */
  viewOptions?: UseInViewOptions;
  /**
   * Additional className for the wrapper
   */
  className?: string;
  /**
   * Whether to use a span wrapper (for inline elements)
   * @default false
   */
  inline?: boolean;
  /**
   * Stagger index for sequential animations
   * When provided, delay is calculated as: baseDelay + (staggerIndex * staggerDelay)
   */
  staggerIndex?: number;
  /**
   * Delay multiplier for stagger animations
   * @default 0.1
   */
  staggerDelay?: number;
}

const getVariants = (direction: ScrollRevealProps['direction'], distance: number) => {
  const hidden: any = { opacity: 0 };
  const visible: any = { opacity: 1 };

  switch (direction) {
    case 'up':
      hidden.y = distance;
      visible.y = 0;
      break;
    case 'down':
      hidden.y = -distance;
      visible.y = 0;
      break;
    case 'left':
      hidden.x = distance;
      visible.x = 0;
      break;
    case 'right':
      hidden.x = -distance;
      visible.x = 0;
      break;
    case 'none':
      break;
  }

  return { hidden, visible };
};

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 30,
  viewOptions = { once: true, margin: '-50px' },
  className = '',
  inline = false,
  staggerIndex,
  staggerDelay = 0.1,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const variants = getVariants(direction, distance);
  const actualDelay = staggerIndex !== undefined
    ? delay + (staggerIndex * staggerDelay)
    : delay;

  const MotionComponent = inline ? motion.span : motion.div;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay: actualDelay,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth feel
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * ScrollRevealStagger - Container for staggered child animations
 *
 * Wraps multiple children to animate them sequentially.
 */
export interface ScrollRevealStaggerProps {
  children: ReactNode;
  /**
   * Delay between each child animation
   * @default 0.1
   */
  staggerDelay?: number;
  /**
   * Initial delay before first animation
   * @default 0
   */
  initialDelay?: number;
  /**
   * useInView options
   */
  viewOptions?: UseInViewOptions;
  /**
   * Additional className for the wrapper
   */
  className?: string;
}

export function ScrollRevealStagger({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  viewOptions = { once: true, margin: '-50px' },
  className = '',
}: ScrollRevealStaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
