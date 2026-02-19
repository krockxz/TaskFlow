"use client"

import * as React from "react"
import { motion, type Transition, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Vertical lift amount on hover in pixels
   * @default -8
   */
  hoverLift?: number
  /**
   * Scale amount on hover
   * @default 1.02
   */
  hoverScale?: number
  /**
   * Shadow intensity on hover (0-100, maps to tailwind shadows)
   * @default "xl"
   */
  hoverShadow?: "sm" | "md" | "lg" | "xl" | "2xl" | "none"
  /**
   * Enable/disable hover animation
   * @default true
   */
  animateHover?: boolean
  /**
   * Click/tap scale effect
   * @default true
   */
  animateTap?: boolean
  /**
   * Make the entire card clickable
   */
  clickable?: boolean
  /**
   * Stagger children animation on mount
   * @default false
   */
  staggerChildren?: boolean
  /**
   * Animation duration in seconds
   * @default 0.2
   */
  duration?: number
}

const shadowClasses = {
  sm: "hover:shadow-sm",
  md: "hover:shadow-md",
  lg: "hover:shadow-lg",
  xl: "hover:shadow-xl",
  "2xl": "hover:shadow-2xl",
  none: "",
}

/**
 * AnimatedCard - Enhanced card component with hover lift and shadow effects
 *
 * Wraps the base Card component with smooth elevation animations
 * when hovered. Great for interactive cards, list items, and dashboard widgets.
 *
 * @example
 * ```tsx
 * <AnimatedCard hoverLift={-12} hoverShadow="2xl">
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Card content</CardContent>
 * </AnimatedCard>
 *
 * <AnimatedCard clickable onClick={() => navigate("/details")}>
 *   <CardContent>Click me anywhere</CardContent>
 * </AnimatedCard>
 * ```
 */
export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      className,
      children,
      hoverLift = -8,
      hoverScale = 1.02,
      hoverShadow = "xl",
      animateHover = true,
      animateTap = true,
      clickable = false,
      staggerChildren = false,
      duration = 0.2,
      onClick,
      ...props
    },
    ref
  ) => {
    const transition: Transition = {
      type: "spring",
      stiffness: 300,
      damping: 25,
    }

    const hoverAnimation = animateHover
      ? {
          y: hoverLift,
          scale: hoverScale,
        }
      : undefined

    const tapAnimation = animateTap ? { scale: 0.98 } : undefined

    const containerVariants = staggerChildren
      ? {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }
      : undefined

    const itemVariants = staggerChildren
      ? {
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 24,
            },
          },
        }
      : undefined

    const cardContent = (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-200",
          shadowClasses[hoverShadow],
          clickable && "cursor-pointer",
          animateHover && "will-change-transform",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    )

    if (staggerChildren) {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            whileHover={hoverAnimation}
            whileTap={tapAnimation}
            transition={transition}
            onClick={onClick}
            variants={itemVariants}
          >
            {cardContent}
          </motion.div>
        </motion.div>
      )
    }

    return (
      <motion.div
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        transition={transition}
        onClick={onClick}
      >
        {cardContent}
      </motion.div>
    )
  }
)

AnimatedCard.displayName = "AnimatedCard"

/**
 * AnimatedCardHeader - Card header with slide-in animation
 */
export const AnimatedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    delay?: number
  }
>(({ className, children, delay = 0, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
})

AnimatedCardHeader.displayName = "AnimatedCardHeader"

/**
 * AnimatedCardTitle - Card title with fade-in animation
 */
export const AnimatedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    delay?: number
  }
>(({ className, children, delay = 0.1, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
})

AnimatedCardTitle.displayName = "AnimatedCardTitle"

/**
 * AnimatedCardContent - Card content with fade-in animation
 */
export const AnimatedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    delay?: number
  }
>(({ className, children, delay = 0.15, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
})

AnimatedCardContent.displayName = "AnimatedCardContent"

/**
 * AnimatedCardFooter - Card footer with slide-up animation
 */
export const AnimatedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    delay?: number
  }
>(({ className, children, delay = 0.2, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
})

AnimatedCardFooter.displayName = "AnimatedCardFooter"

/**
 * ExpandableCard - Card that can expand/collapse with animation
 */
export interface ExpandableCardProps extends AnimatedCardProps {
  /**
   * Whether the card is expanded
   */
  isExpanded: boolean
  /**
   * Callback when expansion state changes
   */
  onExpandedChange: (expanded: boolean) => void
  /**
   * Content shown when collapsed
   */
  collapsedContent?: React.ReactNode
  /**
   * Content shown when expanded
   */
  expandedContent?: React.ReactNode
  /**
   * Max height when collapsed (in pixels)
   * @default 100
   */
  collapsedHeight?: number
}

export const ExpandableCard = React.forwardRef<
  HTMLDivElement,
  ExpandableCardProps
>(
  (
    {
      className,
      children,
      isExpanded,
      onExpandedChange,
      collapsedContent,
      expandedContent,
      collapsedHeight = 100,
      ...props
    },
    ref
  ) => {
    const contentHeight = React.useRef<HTMLDivElement>(null)
    const [height, setHeight] = React.useState(collapsedHeight)

    React.useEffect(() => {
      if (contentHeight.current) {
        setHeight(isExpanded ? contentHeight.current.scrollHeight : collapsedHeight)
      }
    }, [isExpanded, collapsedHeight])

    return (
      <AnimatedCard ref={ref} className={cn(className)} {...props}>
        <div className="overflow-hidden">
          <motion.div
            animate={{ height }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div ref={contentHeight}>
              {collapsedContent && !isExpanded && collapsedContent}
              {expandedContent && isExpanded && expandedContent}
              {!collapsedContent && !expandedContent && children}
            </div>
          </motion.div>
        </div>

        <motion.button
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => onExpandedChange(!isExpanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center gap-1"
          >
            <span>{isExpanded ? "Show less" : "Show more"}</span>
          </motion.div>
        </motion.button>
      </AnimatedCard>
    )
  }
)

ExpandableCard.displayName = "ExpandableCard"

/**
 * CardGrid - Grid container with staggered card animations
 */
export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns (responsive)
   * @default 3
   */
  cols?: 1 | 2 | 3 | 4
  /**
   * Gap between cards
   * @default "gap-4"
   */
  gap?: string
  /**
   * Stagger delay between cards in seconds
   * @default 0.05
   */
  staggerDelay?: number
}

const colsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
}

export const CardGrid = React.forwardRef<HTMLDivElement, CardGridProps>(
  (
    {
      className,
      children,
      cols = 3,
      gap = "gap-4",
      staggerDelay = 0.05,
      ...props
    },
    ref
  ) => {
    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 24,
        },
      },
    }

    return (
      <motion.div
        ref={ref}
        className={cn("grid", colsClasses[cols], gap, className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {React.Children.map(children, (child) => (
          <motion.div variants={itemVariants}>{child}</motion.div>
        ))}
      </motion.div>
    )
  }
)

CardGrid.displayName = "CardGrid"
