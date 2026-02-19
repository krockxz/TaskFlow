"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  /**
   * The type of transition animation
   * @default "fade-slide"
   */
  type?: "fade" | "fade-slide" | "slide-up" | "slide-down" | "scale" | "none"
  /**
   * Duration of the transition in seconds
   * @default 0.3
   */
  duration?: number
  /**
   * Custom enter animation
   */
  enterAnimation?: object
  /**
   * Custom exit animation
   */
  exitAnimation?: object
}

const transitionVariants = {
  fade: {
    enter: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "fade-slide": {
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: -20, y: 0 },
  },
  "slide-up": {
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  "slide-down": {
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scale: {
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  none: {
    enter: {},
    exit: {},
  },
}

const defaultTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
}

/**
 * PageTransition - Wrapper component for route transition animations
 *
 * Wrap your page content with this component to enable smooth transitions
 * between routes. Uses AnimatePresence for exit animations.
 *
 * @example
 * ```tsx
 * export default function Layout({ children }) {
 *   return (
 *     <PageTransition type="fade-slide">
 *       {children}
 *     </PageTransition>
 *   )
 * }
 * ```
 */
export const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(
  (
    {
      children,
      className,
      type = "fade-slide",
      duration = 0.3,
      enterAnimation,
      exitAnimation,
    },
    ref
  ) => {
    const variants = transitionVariants[type]
    const transition = React.useMemo(
      () => ({ ...defaultTransition, duration }),
      [duration]
    )

    const enter = enterAnimation ?? variants.enter
    const exit = exitAnimation ?? variants.exit

    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          ref={ref}
          initial={type === "none" ? false : "exit"}
          animate="enter"
          exit="exit"
          variants={{ enter, exit }}
          transition={transition}
          className={cn("w-full", className)}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }
)

PageTransition.displayName = "PageTransition"

/**
 * Hook to get the current pathname for route change detection
 * Useful for triggering animations on route changes
 */
export function useRouteChange() {
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = React.useState(pathname)
  const hasChanged = pathname !== prevPathname

  React.useEffect(() => {
    if (hasChanged) {
      setPrevPathname(pathname)
    }
  }, [pathname, hasChanged])

  return { pathname, prevPathname, hasChanged }
}

/**
 * TransitionDirection - Helper component for directional page transitions
 *
 * Automatically determines the slide direction based on route depth
 * for a more natural navigation feel.
 */
export interface TransitionDirectionProps extends PageTransitionProps {
  fallback?: PageTransitionProps["type"]
}

export const TransitionDirection = React.forwardRef<
  HTMLDivElement,
  TransitionDirectionProps
>(({ children, className, fallback = "fade-slide", ...props }, ref) => {
  const { pathname } = useRouteChange()
  const [direction, setDirection] = React.useState<"forward" | "backward">(
    "forward"
  )

  // Store previous path for comparison
  const prevPathname = React.useRef(pathname)
  React.useEffect(() => {
    const prevDepth = prevPathname.current?.split("/").length ?? 0
    const currentDepth = pathname.split("/").length
    setDirection(currentDepth >= prevDepth ? "forward" : "backward")
    prevPathname.current = pathname
  }, [pathname])

  const slideVariants = {
    forward: {
      enter: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    backward: {
      enter: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
  }

  const currentVariant = slideVariants[direction]

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        ref={ref}
        key={pathname}
        initial="exit"
        animate="enter"
        exit="exit"
        variants={currentVariant}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
})

TransitionDirection.displayName = "TransitionDirection"
