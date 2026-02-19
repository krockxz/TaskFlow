"use client"

import * as React from "react"
import { motion, type Transition } from "motion/react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Spinner - A rotating loading indicator
 */
export interface SpinnerProps {
  /**
   * Size of the spinner in pixels
   * @default 24
   */
  size?: number
  /**
   * Color of the spinner
   * @default "currentColor"
   */
  color?: string
  /**
   * Stroke width in pixels
   * @default 2.5
   */
  strokeWidth?: number
  /**
   * Animation duration in seconds
   * @default 1
   */
  duration?: number
  className?: string
}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  (
    {
      size = 24,
      color = "currentColor",
      strokeWidth = 2.5,
      duration = 1,
      className,
    },
    ref
  ) => {
    const circumference = 2 * Math.PI * 22 // 22 is the radius

    return (
      <motion.svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className={cn("inline-block", className)}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="22"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={0.25}
        />
        <motion.circle
          cx="25"
          cy="25"
          r="22"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0.25, rotate: -90 }}
          animate={{ pathLength: [0.25, 0.75, 0.25] }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: "center",
          }}
        />
      </motion.svg>
    )
  }
)

Spinner.displayName = "Spinner"

/**
 * SpinnerWithLabel - Spinner with optional label text
 */
export interface SpinnerWithLabelProps extends SpinnerProps {
  /**
   * Text to display below or next to the spinner
   */
  label?: string
  /**
   * Position of the label relative to spinner
   * @default "bottom"
   */
  labelPosition?: "bottom" | "right" | "left"
  /**
   * Label text styling
   */
  labelClassName?: string
}

export const SpinnerWithLabel = React.forwardRef<
  SVGSVGElement,
  SpinnerWithLabelProps
>(({ label, labelPosition = "bottom", labelClassName, ...props }, ref) => {
  const containerClass = {
    bottom: "flex-col",
    right: "flex-row",
    left: "flex-row-reverse",
  }[labelPosition]

  return (
    <div className={cn("flex items-center gap-2", containerClass)}>
      <Spinner ref={ref} {...props} />
      {label && (
        <span className={cn("text-sm text-muted-foreground", labelClassName)}>
          {label}
        </span>
      )}
    </div>
  )
})

SpinnerWithLabel.displayName = "SpinnerWithLabel"

/**
 * LoadingDots - Bouncing dots animation
 */
export interface LoadingDotsProps {
  /**
   * Number of dots
   * @default 3
   */
  count?: number
  /**
   * Size of each dot in pixels
   * @default 8
   */
  size?: number
  /**
   * Color of the dots
   * @default "currentColor"
   */
  color?: string
  /**
   * Animation duration in seconds
   * @default 0.6
   */
  duration?: number
  className?: string
}

export const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  (
    {
      count = 3,
      size = 8,
      color = "currentColor",
      duration = 0.6,
      className,
    },
    ref
  ) => {
    const dots = Array.from({ length: count }, (_, i) => i)

    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)}>
        {dots.map((i) => (
          <motion.div
            key={i}
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: "50%",
            }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    )
  }
)

LoadingDots.displayName = "LoadingDots"

/**
 * BarLoader - Horizontal bar loading animation
 */
export interface BarLoaderProps {
  /**
   * Width of the bar in pixels or CSS value
   * @default 200
   */
  width?: number | string
  /**
   * Height of the bar in pixels
   * @default 4
   */
  height?: number
  /**
   * Color of the loading bar
   */
  color?: string
  /**
   * Animation duration in seconds
   * @default 1.5
   */
  duration?: number
  className?: string
}

export const BarLoader = React.forwardRef<HTMLDivElement, BarLoaderProps>(
  ({ width = 200, height = 4, color = "hsl(var(--primary))", duration = 1.5, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden rounded-full bg-muted", className)}
        style={{ width: typeof width === "number" ? `${width}px` : width, height: `${height}px` }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    )
  }
)

BarLoader.displayName = "BarLoader"

/**
 * PulseLoader - Pulsing circle animation
 */
export interface PulseLoaderProps {
  /**
   * Size of the center circle in pixels
   * @default 16
   */
  size?: number
  /**
   * Color of the pulse
   * @default "hsl(var(--primary))"
   */
  color?: string
  /**
   * Animation duration in seconds
   * @default 1.5
   */
  duration?: number
  className?: string
}

export const PulseLoader = React.forwardRef<HTMLDivElement, PulseLoaderProps>(
  ({ size = 16, color = "hsl(var(--primary))", duration = 1.5, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size * 3, height: size * 3 }}
      >
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Inner pulsing ring */}
        <motion.div
          className="absolute rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0.3, 0.8],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: duration / 3,
          }}
        />
        {/* Center circle */}
        <div
          className="relative rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
        />
      </div>
    )
  }
)

PulseLoader.displayName = "PulseLoader"

/**
 * SkeletonWrapper - Wraps content with skeleton loading state
 */
export interface SkeletonWrapperProps {
  /**
   * Whether content is loading
   */
  isLoading: boolean
  /**
   * The actual content to show when loaded
   */
  children: React.ReactNode
  /**
   * Custom skeleton component (optional)
   */
  skeleton?: React.ReactNode
  /**
   * Number of skeleton rows to show
   * @default 3
   */
  rows?: number
  /**
   * Height of each skeleton row
   * @default "h-4"
   */
  rowHeight?: string
  className?: string
}

export const SkeletonWrapper = React.forwardRef<
  HTMLDivElement,
  SkeletonWrapperProps
>(({ isLoading, children, skeleton, rows = 3, rowHeight = "h-4", className }, ref) => {
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className={cn("w-full", rowHeight)} />
        ))}
      </div>
    )
  }

  return <>{children}</>
})

SkeletonWrapper.displayName = "SkeletonWrapper"

/**
 * PageLoader - Full-page loading overlay
 */
export interface PageLoaderProps {
  /**
   * Whether the page is loading
   */
  isLoading: boolean
  /**
   * Type of loader to display
   * @default "spinner"
   */
  type?: "spinner" | "dots" | "pulse" | "bar" | "skeleton"
  /**
   * Optional loading message
   */
  message?: string
  /**
   * Background color/blur
   * @default true
   */
  backdrop?: boolean
  className?: string
}

export const PageLoader = React.forwardRef<HTMLDivElement, PageLoaderProps>(
  ({ isLoading, type = "spinner", message, backdrop = true, className }, ref) => {
    if (!isLoading) return null

    const renderLoader = () => {
      switch (type) {
        case "dots":
          return <LoadingDots />
        case "pulse":
          return <PulseLoader />
        case "bar":
          return <BarLoader width={200} />
        case "skeleton":
          return (
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )
        default:
          return <Spinner size={32} />
      }
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          backdrop && "bg-background/80 backdrop-blur-sm",
          className
        )}
      >
        <div className="flex flex-col items-center gap-4">
          {renderLoader()}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              {message}
            </motion.p>
          )}
        </div>
      </motion.div>
    )
  }
)

PageLoader.displayName = "PageLoader"

/**
 * ProgressLoader - Circular progress with percentage
 */
export interface ProgressLoaderProps {
  /**
   * Progress value (0-100)
   */
  progress: number
  /**
   * Size in pixels
   * @default 80
   */
  size?: number
  /**
   * Color of the progress bar
   */
  color?: string
  /**
   * Stroke width in pixels
   * @default 4
   */
  strokeWidth?: number
  /**
   * Show percentage text in center
   * @default true
   */
  showPercentage?: boolean
  className?: string
}

export const ProgressLoader = React.forwardRef<
  SVGSVGElement,
  ProgressLoaderProps
>(
  (
    {
      progress,
      size = 80,
      color = "hsl(var(--primary))",
      strokeWidth = 4,
      showPercentage = true,
      className,
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
      <div
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <svg
          ref={ref}
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    )
  }
)

ProgressLoader.displayName = "ProgressLoader"

/**
 * InlineLoader - Small inline loading indicator
 */
export interface InlineLoaderProps {
  /**
   * Text to display
   * @default "Loading..."
   */
  text?: string
  /**
   * Type of indicator
   * @default "dots"
   */
  type?: "spinner" | "dots"
  className?: string
}

export const InlineLoader = React.forwardRef<HTMLSpanElement, InlineLoaderProps>(
  ({ text = "Loading...", type = "dots", className }, ref) => {
    return (
      <span ref={ref} className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
        {type === "spinner" ? <Spinner size={14} /> : <LoadingDots count={3} size={4} />}
        {text}
      </span>
    )
  }
)

InlineLoader.displayName = "InlineLoader"
