"use client"

import * as React from "react"
import { motion, type MotionConfig, type Transition } from "motion/react"

import { cn } from "@/lib/utils"

export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Color of the focus ring
   * @default "ring-ring"
   */
  focusRingColor?: string
  /**
   * Width of the focus ring in pixels
   * @default 2
   */
  focusRingWidth?: number
  /**
   * Border radius of the focus ring
   * @default "rounded-md"
   */
  focusRingRadius?: string
  /**
   * Label text displayed above the input
   */
  label?: string
  /**
   * Error message to display
   */
  error?: string
  /**
   * Helper text displayed below the input
   */
  helperText?: string
  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode
  /**
   * Duration of the focus animation in seconds
   * @default 0.2
   */
  animationDuration?: number
}

/**
 * AnimatedInput - Enhanced input component with animated focus ring
 *
 * Features a smooth expanding ring animation when the input is focused,
 * with optional label, error states, and icons.
 *
 * @example
 * ```tsx
 * <AnimatedInput
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email?.message}
 * />
 *
 * <AnimatedInput
 *   leftIcon={<Search />}
 *   placeholder="Search..."
 * />
 * ```
 */
export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      focusRingColor = "ring-ring",
      focusRingWidth = 2,
      focusRingRadius = "rounded-md",
      animationDuration = 0.2,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const transition: Transition = {
      type: "tween",
      duration: animationDuration,
      ease: "easeOut",
    }

    const hasError = !!error
    const errorColor = "destructive"

    return (
      <div className="relative w-full">
        {label && (
          <motion.label
            htmlFor={props.id}
            className={cn(
              "mb-1.5 block text-sm font-medium",
              isFocused && !hasError && "text-primary",
              hasError && "text-destructive",
              !isFocused && !hasError && "text-muted-foreground"
            )}
            animate={{
              scale: isFocused ? 1.02 : 1,
            }}
            transition={transition}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <div className="relative">
            {/* Focus ring overlay */}
            <motion.div
              className={cn(
                "absolute inset-0 pointer-events-none",
                focusRingRadius
              )}
              animate={{
                boxShadow: isFocused
                  ? `0 0 0 ${focusRingWidth}px var(--${hasError ? errorColor : focusRingColor.replace("ring-", "")})`
                  : "none",
              }}
              transition={transition}
            />

            <input
              ref={ref}
              type={type}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1",
                "text-base shadow-sm transition-colors",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                "md:text-sm",
                hasError && "border-destructive",
                leftIcon && "pl-10",
                rightIcon && "pr-10",
                className
              )}
              onFocus={(e) => {
                setIsFocused(true)
                props.onFocus?.(e)
              }}
              onBlur={(e) => {
                setIsFocused(false)
                props.onBlur?.(e)
              }}
              disabled={disabled}
              {...props}
            />
          </div>

          {rightIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message with slide animation */}
        <AnimatePresence>
          {(error || helperText) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={transition}
              className="overflow-hidden"
            >
              <p
                className={cn(
                  "mt-1.5 text-xs",
                  hasError ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {error || helperText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedInput.displayName = "AnimatedInput"

/**
 * AnimatedTextarea - Textarea variant with the same focus animation
 */
export interface AnimatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  focusRingColor?: string
  focusRingWidth?: number
  focusRingRadius?: string
  animationDuration?: number
  /**
   * Minimum height in rows
   * @default 3
   */
  minRows?: number
}

export const AnimatedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AnimatedTextareaProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      focusRingColor = "ring-ring",
      focusRingWidth = 2,
      focusRingRadius = "rounded-md",
      animationDuration = 0.2,
      minRows = 3,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const transition: Transition = {
      type: "tween",
      duration: animationDuration,
      ease: "easeOut",
    }

    const hasError = !!error

    return (
      <div className="relative w-full">
        {label && (
          <motion.label
            htmlFor={props.id}
            className={cn(
              "mb-1.5 block text-sm font-medium",
              isFocused && !hasError && "text-primary",
              hasError && "text-destructive",
              !isFocused && !hasError && "text-muted-foreground"
            )}
            animate={{
              scale: isFocused ? 1.02 : 1,
            }}
            transition={transition}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          <motion.div
            className={cn("absolute inset-0 pointer-events-none", focusRingRadius)}
            animate={{
              boxShadow: isFocused
                ? `0 0 0 ${focusRingWidth}px var(--${hasError ? "destructive" : focusRingColor.replace("ring-", "")})`
                : "none",
            }}
            transition={transition}
          />

          <textarea
            ref={ref}
            rows={minRows}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2",
              "text-base shadow-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              "md:text-sm resize-y",
              hasError && "border-destructive",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            disabled={disabled}
            {...props}
          />
        </div>

        <AnimatePresence>
          {(error || helperText) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={transition}
              className="overflow-hidden"
            >
              <p
                className={cn(
                  "mt-1.5 text-xs",
                  hasError ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {error || helperText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedTextarea.displayName = "AnimatedTextarea"

/**
 * FloatingLabelInput - Input with animated floating label
 */
export interface FloatingLabelInputProps extends AnimatedInputProps {
  /**
   * Label always floats or only on focus/value
   * @default "auto"
   */
  floatLabel?: "always" | "auto"
}

export const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(({ className, label, floatLabel = "auto", value, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const hasValue = value !== "" && value !== undefined

  const shouldFloat = floatLabel === "always" || isFocused || hasValue

  return (
    <div className="relative">
      <motion.input
        ref={ref}
        className={cn(
          "peer h-12 w-full rounded-md border border-input bg-transparent px-3 pt-4 pb-1",
          "text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className
        )}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        value={value}
        {...props}
      />

      {label && (
        <motion.label
          htmlFor={props.id}
          className={cn(
            "absolute left-3 pointer-events-none text-muted-foreground transition-colors",
            "peer-focus:text-primary peer-disabled:opacity-50"
          )}
          animate={{
            top: shouldFloat ? "4px" : "50%",
            fontSize: shouldFloat ? "10px" : "14px",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            transformOrigin: "left top",
          }}
        >
          {label}
        </motion.label>
      )}
    </div>
  )
})

FloatingLabelInput.displayName = "FloatingLabelInput"

// Re-export for internal use
const AnimatePresence = motion.div
