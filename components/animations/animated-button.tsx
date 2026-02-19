"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Event handlers that conflict with Framer Motion
type ConflictingEventHandlers =
  | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'onDragEnter' | 'onDragExit' | 'onDragOver' | 'onDrop'
  | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
  | 'onTransitionStart' | 'onTransitionEnd' | 'onTransitionCancel'

export interface AnimatedButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, ConflictingEventHandlers>,
    VariantProps<typeof buttonVariants> {
  /**
   * Scale amount on hover (1 = no scale, 1.05 = 5% larger)
   * @default 1.02
   */
  hoverScale?: number
  /**
   * Scale amount on tap/click (1 = no scale, 0.95 = 5% smaller)
   * @default 0.97
   */
  tapScale?: number
  /**
   * Enable/disable hover animation
   * @default true
   */
  animateHover?: boolean
  /**
   * Enable/disable tap animation
   * @default true
   */
  animateTap?: boolean
  /**
   * Spring stiffness for animations
   * @default 400
   */
  stiffness?: number
  /**
   * Spring damping for animations
   * @default 17
   */
  damping?: number
  asChild?: boolean
}

/**
 * AnimatedButton - Enhanced button component with spring-based animations
 *
 * Wraps the base Button component with smooth hover and tap animations
 * using Framer Motion's spring physics.
 *
 * @example
 * ```tsx
 * <AnimatedButton hoverScale={1.05} tapScale={0.95}>
 *   Click me
 * </AnimatedButton>
 *
 * <AnimatedButton variant="outline" animateHover={false}>
 *   No hover effect
 * </AnimatedButton>
 * ```
 */
export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(
  (
    {
      className,
      variant,
      size,
      hoverScale = 1.02,
      tapScale = 0.97,
      animateHover = true,
      animateTap = true,
      stiffness = 400,
      damping = 17,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const springTransition = React.useMemo(
      () => ({
        type: "spring" as const,
        stiffness,
        damping,
      }),
      [stiffness, damping]
    )

    const whileHover = React.useMemo(() => {
      if (!animateHover || disabled) return undefined
      return { scale: hoverScale }
    }, [animateHover, hoverScale, disabled])

    const whileTap = React.useMemo(() => {
      if (!animateTap || disabled) return undefined
      return { scale: tapScale }
    }, [animateTap, tapScale, disabled])

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled}
        whileHover={whileHover}
        whileTap={whileTap}
        transition={springTransition}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

/**
 * AnimatedButtonGroup - A group of animated buttons with shared animation settings
 */
export interface AnimatedButtonGroupProps {
  children: React.ReactNode
  className?: string
  /**
   * Shared hover scale for all buttons in the group
   */
  hoverScale?: number
  /**
   * Shared tap scale for all buttons in the group
   */
  tapScale?: number
  /**
   * Gap between buttons
   * @default "gap-2"
   */
  gap?: string
}

export const AnimatedButtonGroup = React.forwardRef<
  HTMLDivElement,
  AnimatedButtonGroupProps
>(({ children, className, hoverScale, tapScale, gap = "gap-2" }, ref) => {
  return (
    <div ref={ref} className={cn("flex", gap, className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<AnimatedButtonProps>(child)) {
          return React.cloneElement(child, {
            hoverScale: hoverScale ?? child.props.hoverScale,
            tapScale: tapScale ?? child.props.tapScale,
          })
        }
        return child
      })}
    </div>
  )
})

AnimatedButtonGroup.displayName = "AnimatedButtonGroup"

/**
 * IconAnimatedButton - A button specifically designed for icon-only buttons
 * with circular hover background animation
 */
export interface IconAnimatedButtonProps extends Omit<AnimatedButtonProps, "size"> {
  icon: React.ReactNode
  tooltip?: string
  /**
   * Background color on hover
   * @default "bg-accent"
   */
  hoverBg?: string
}

export const IconAnimatedButton = React.forwardRef<
  HTMLButtonElement,
  IconAnimatedButtonProps
>(({ className, icon, tooltip, hoverBg = "bg-accent", variant = "ghost", ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md",
        "transition-colors focus-visible:outline-none focus-visible:ring-1",
        "focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      <motion.div
        className={cn("absolute inset-0 rounded-md opacity-0", hoverBg)}
        initial={false}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
      <span className="relative z-10">{icon}</span>
      {tooltip && (
        <span className="sr-only">{tooltip}</span>
      )}
    </motion.button>
  )
})

IconAnimatedButton.displayName = "IconAnimatedButton"

/**
 * RippleButton - Button with material design-style ripple effect
 */
export interface RippleButtonProps extends AnimatedButtonProps {
  /**
   * Color of the ripple effect
   * @default "rgba(255, 255, 255, 0.5)"
   */
  rippleColor?: string
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(({ className, children, rippleColor = "rgba(255, 255, 255, 0.5)", ...props }, ref) => {
  const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples((prev) => [...prev, newRipple])

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)
  }

  return (
    <AnimatedButton
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
            borderRadius: "50%",
          }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{
            width: 300,
            height: 300,
            opacity: 0,
            x: -150,
            y: -150,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </AnimatedButton>
  )
})

RippleButton.displayName = "RippleButton"
