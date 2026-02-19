"use client"

import * as React from "react"
import { AnimatePresence, motion, type Transition } from "motion/react"
import { Check, X, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

// Event handlers that conflict with Framer Motion
type ConflictingEventHandlers =
  | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'onDragEnter' | 'onDragExit' | 'onDragOver' | 'onDrop'
  | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
  | 'onTransitionStart' | 'onTransitionEnd' | 'onTransitionCancel'

/**
 * SuccessCheckmark - Animated success checkmark indicator
 */
export interface SuccessCheckmarkProps {
  /**
   * Size of the checkmark container in pixels
   * @default 64
   */
  size?: number
  /**
   * Color of the checkmark
   * @default "hsl(142, 76%, 36%)"
   */
  color?: string
  /**
   * Show circular background
   * @default true
   */
  showBackground?: boolean
  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number
  className?: string
}

export const SuccessCheckmark = React.forwardRef<
  HTMLDivElement,
  SuccessCheckmarkProps
>(({ size = 64, color = "hsl(142, 76%, 36%)", showBackground = true, delay = 0, className }, ref) => {
  const strokeWidth = size / 16
  const checkmarkSize = size / 2

  return (
    <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background circle */}
      {showBackground && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `${color}15` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay, duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }}
        />
      )}

      {/* Checkmark SVG */}
      <svg width={checkmarkSize} height={checkmarkSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        {/* Circle */}
        {showBackground && (
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: delay + 0.1, duration: 0.4, ease: "easeInOut" }}
          />
        )}

        {/* Checkmark path */}
        <motion.path
          d="M4 12L9 17L20 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.4, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )
})

SuccessCheckmark.displayName = "SuccessCheckmark"

/**
 * ErrorX - Animated error X indicator
 */
export interface ErrorXProps {
  /**
   * Size of the X container in pixels
   * @default 64
   */
  size?: number
  /**
   * Color of the X
   * @default "hsl(var(--destructive))"
   */
  color?: string
  /**
   * Show circular background
   * @default true
   */
  showBackground?: boolean
  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number
  className?: string
}

export const ErrorX = React.forwardRef<HTMLDivElement, ErrorXProps>(
  ({ size = 64, color = "hsl(var(--destructive))", showBackground = true, delay = 0, className }, ref) => {
    const strokeWidth = size / 16
    const xSize = size / 2

    return (
      <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
        {/* Background circle */}
        {showBackground && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: `${color}15` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay, duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }}
          />
        )}

        {/* X SVG */}
        <svg width={xSize} height={xSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
          {/* Circle */}
          {showBackground && (
            <motion.circle
              cx="12"
              cy="12"
              r="10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: delay + 0.1, duration: 0.4, ease: "easeInOut" }}
            />
          )}

          {/* X path - first line */}
          <motion.line
            x1="8"
            y1="8"
            x2="16"
            y2="16"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.3, ease: "easeInOut" }}
          />

          {/* X path - second line */}
          <motion.line
            x1="16"
            y1="8"
            x2="8"
            y2="16"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.3, ease: "easeInOut" }}
          />
        </svg>
      </div>
    )
  }
)

ErrorX.displayName = "ErrorX"

/**
 * ShakeAnimation - Wrapper that shakes its children
 */
export interface ShakeAnimationProps {
  children: React.ReactNode
  /**
   * Trigger shake on value change
   */
  trigger?: any
  /**
   * Shake intensity
   * @default 5
   */
  intensity?: number
  /**
   * Number of shake cycles
   * @default 3
   */
  cycles?: number
  /**
   * Duration in seconds
   * @default 0.4
   */
  duration?: number
  className?: string
}

export const ShakeAnimation = React.forwardRef<
  HTMLDivElement,
  ShakeAnimationProps
>(({ children, trigger, intensity = 5, cycles = 3, duration = 0.4, className }, ref) => {
  const [key, setKey] = React.useState(0)

  React.useEffect(() => {
    if (trigger !== undefined) {
      setKey((prev) => prev + 1)
    }
  }, [trigger])

  // Generate shake keyframes
  const shakeAnimation = React.useMemo(() => {
    // Create a sequence of keyframes for x position
    const frames: number[] = []

    frames.push(0)

    for (let i = 0; i < cycles; i++) {
      frames.push(-intensity)
      frames.push(intensity)
    }

    frames.push(0)

    return {
      x: frames,
    }
  }, [intensity, cycles])

  return (
    <motion.div
      ref={ref}
      key={key}
      className={cn("inline-block", className)}
      animate={shakeAnimation as any}
      transition={{ duration: duration / (cycles * 2) }}
    >
      {children}
    </motion.div>
  )
})

ShakeAnimation.displayName = "ShakeAnimation"

/**
 * SlideInToast - Toast notification with slide-in animation
 */
export interface SlideInToastProps {
  /**
   * Whether the toast is visible
   */
  isOpen: boolean
  /**
   * Content to display in the toast
   */
  children: React.ReactNode
  /**
   * Type of toast
   * @default "default"
   */
  variant?: "default" | "success" | "error" | "warning" | "info"
  /**
   * Position of the toast
   * @default "bottom-right"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
  /**
   * Auto-dismiss after duration (ms)
   * @default 5000
   */
  duration?: number
  /**
   * Callback when toast is dismissed
   */
  onDismiss?: () => void
  /**
   * Custom icon
   */
  icon?: React.ReactNode
  className?: string
}

const variantStyles = {
  default: "bg-background border-border text-foreground",
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
}

const positionClasses = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
}

export const SlideInToast = React.forwardRef<HTMLDivElement, SlideInToastProps>(
  ({ isOpen, children, variant = "default", position = "bottom-right", duration = 5000, onDismiss, icon, className }, ref) => {
    React.useEffect(() => {
      if (isOpen && duration > 0) {
        const timer = setTimeout(() => {
          onDismiss?.()
        }, duration)
        return () => clearTimeout(timer)
      }
    }, [isOpen, duration, onDismiss])

    const defaultIcon = {
      default: <AlertCircle className="h-5 w-5" />,
      success: <Check className="h-5 w-5" />,
      error: <X className="h-5 w-5" />,
      warning: <AlertCircle className="h-5 w-5" />,
      info: <AlertCircle className="h-5 w-5" />,
    }

    const slideVariants = {
      "top-left": { hidden: { x: "-100%", opacity: 0 }, visible: { x: 0, opacity: 1 } },
      "top-right": { hidden: { x: "100%", opacity: 0 }, visible: { x: 0, opacity: 1 } },
      "bottom-left": { hidden: { x: "-100%", opacity: 0 }, visible: { x: 0, opacity: 1 } },
      "bottom-right": { hidden: { x: "100%", opacity: 0 }, visible: { x: 0, opacity: 1 } },
      "top-center": { hidden: { y: "-100%", opacity: 0 }, visible: { y: 0, opacity: 1 } },
      "bottom-center": { hidden: { y: "100%", opacity: 0 }, visible: { y: 0, opacity: 1 } },
    }

    const variants = slideVariants[position]

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={ref}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
            className={cn(
              "fixed z-50 flex max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg",
              variantStyles[variant],
              positionClasses[position],
              className
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {icon || defaultIcon[variant]}
            </div>
            <div className="flex-1">
              {children}
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

SlideInToast.displayName = "SlideInToast"

/**
 * ProgressToast - Toast with progress bar
 */
export interface ProgressToastProps {
  /**
   * Whether the toast is visible
   */
  isOpen: boolean
  /**
   * Progress value (0-100)
   */
  progress: number
  /**
   * Title text
   */
  title?: string
  /**
   * Description text
   */
  description?: string
  /**
   * Position of the toast
   * @default "bottom-right"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  /**
   * Color of the progress bar
   */
  color?: string
  className?: string
}

export const ProgressToast = React.forwardRef<HTMLDivElement, ProgressToastProps>(
  ({ isOpen, progress, title, description, position = "bottom-right", color = "hsl(var(--primary))", className }, ref) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
            className={cn(
              "fixed z-50 w-80 rounded-lg border bg-background p-4 shadow-lg",
              positionClasses[position],
              className
            )}
          >
            {title && (
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-sm">{title}</span>
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }}
              />
            </div>
            {description && (
              <p className="mt-2 text-xs text-muted-foreground">{description}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

ProgressToast.displayName = "ProgressToast"

/**
 * Confetti - Simple confetti celebration animation
 */
export interface ConfettiProps {
  /**
   * Number of confetti pieces
   * @default 50
   */
  count?: number
  /**
   * Colors to use for confetti
   */
  colors?: string[]
  /**
   * Duration in seconds
   * @default 3
   */
  duration?: number
  /**
   * Trigger value to start animation
   */
  trigger?: any
  className?: string
}

const defaultConfettiColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52B788"
]

export const Confetti = React.forwardRef<HTMLDivElement, ConfettiProps>(
  ({ count = 50, colors = defaultConfettiColors, duration = 3, trigger, className }, ref) => {
    const [particles, setParticles] = React.useState<Array<{ id: number; x: number; y: number; color: string; rotation: number; scale: number }>>([])

    React.useEffect(() => {
      if (trigger !== undefined) {
        const newParticles = Array.from({ length: count }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100 - 50, // centered x position
          y: -20 - Math.random() * 40, // start above viewport
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        }))
        setParticles(newParticles)

        // Clear particles after animation
        const timer = setTimeout(() => setParticles([]), duration * 1000)
        return () => clearTimeout(timer)
      }
    }, [trigger, count, colors, duration])

    return (
      <div ref={ref} className={cn("fixed inset-0 pointer-events-none overflow-hidden", className)} style={{ zIndex: 100 }}>
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute top-1/2 left-1/2"
              initial={{
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: particle.x * 10,
                y: 400 + Math.random() * 200,
                rotate: particle.rotation + 720,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration,
                ease: [0.25, 0.1, 0.25, 1] as const,
              }}
              style={{
                backgroundColor: particle.color,
                width: 8 * particle.scale,
                height: 8 * particle.scale,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    )
  }
)

Confetti.displayName = "Confetti"

/**
 * FadeIn - Content with minimal fade-in animation
 */
export interface BounceInProps {
  children: React.ReactNode
  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number
  /**
   * Animation duration in seconds
   * @default 0.5
   */
  duration?: number
  className?: string
}

export const BounceIn = React.forwardRef<HTMLDivElement, BounceInProps>(
  ({ children, delay = 0, duration = 0.3, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay,
          duration,
          ease: [0.4, 0, 0.2, 1] as const,
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }
)

BounceIn.displayName = "BounceIn"

/**
 * TypewriterText - Text with typewriter effect
 */
export interface TypewriterTextProps {
  /**
   * Text to type out
   */
  text: string
  /**
   * Typing speed in ms per character
   * @default 50
   */
  speed?: number
  /**
   * Show blinking cursor
   * @default true
   */
  showCursor?: boolean
  /**
   * Start animation on mount
   * @default true
   */
  start?: boolean
  /**
   * Callback when typing completes
   */
  onComplete?: () => void
  className?: string
}

export const TypewriterText = React.forwardRef<HTMLSpanElement, TypewriterTextProps>(
  ({ text, speed = 50, showCursor = true, start = true, onComplete, className }, ref) => {
    const [displayText, setDisplayText] = React.useState("")
    const [isComplete, setIsComplete] = React.useState(false)

    React.useEffect(() => {
      if (!start) return

      let index = 0
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(timer)
          setIsComplete(true)
          onComplete?.()
        }
      }, speed)

      return () => clearInterval(timer)
    }, [text, speed, start, onComplete])

    return (
      <span ref={ref} className={className}>
        {displayText}
        {showCursor && !isComplete && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
          />
        )}
      </span>
    )
  }
)

TypewriterText.displayName = "TypewriterText"
