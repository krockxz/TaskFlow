"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

/**
 * AnimatedDialogOverlay - Overlay with backdrop blur effect
 */
const AnimatedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    /**
     * Blur intensity in pixels
     * @default 4
     */
    blurAmount?: number
  }
>(({ className, blurAmount = 4, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 backdrop-blur-sm"
      style={{ backdropBlur: `${blurAmount}px` }}
    />
  </DialogPrimitive.Overlay>
))
AnimatedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * AnimatedDialogContent - Dialog content with scale and slide animations
 */
const AnimatedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /**
     * Animation type variant
     * @default "scale"
     */
    variant?: "scale" | "slide" | "fade" | "none"
    /**
     * Blur intensity for backdrop
     * @default 4
     */
    blurAmount?: number
  }
>(({ className, children, variant = "scale", blurAmount = 4, ...props }, ref) => {
  const variants = {
    scale: {
      closed: { scale: 0.95, opacity: 0 },
      open: { scale: 1, opacity: 1 },
    },
    slide: {
      closed: { y: "100%", opacity: 0 },
      open: { y: 0, opacity: 1 },
    },
    fade: {
      closed: { opacity: 0 },
      open: { opacity: 1 },
    },
    none: {
      closed: {},
      open: {},
    },
  }

  const transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  }

  return (
    <DialogPortal>
      <AnimatedDialogOverlay blurAmount={blurAmount} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
          variant === "slide" && "data-[state=closed]:slide-out-to-top-full",
          className
        )}
        {...props}
      >
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={variants[variant]}
          transition={transition}
        >
          {children}
        </motion.div>
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
AnimatedDialogContent.displayName = DialogPrimitive.Content.displayName

const AnimatedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AnimatedDialogHeader.displayName = "AnimatedDialogHeader"

const AnimatedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AnimatedDialogFooter.displayName = "AnimatedDialogFooter"

const AnimatedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
AnimatedDialogTitle.displayName = DialogPrimitive.Title.displayName

const AnimatedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AnimatedDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogClose,
  DialogTrigger,
  AnimatedDialogOverlay,
  AnimatedDialogContent,
  AnimatedDialogHeader,
  AnimatedDialogFooter,
  AnimatedDialogTitle,
  AnimatedDialogDescription,
}

/**
 * SlideOverDialog - A dialog that slides in from the side
 */
export interface SlideOverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /**
   * Side to slide from
   * @default "right"
   */
  side?: "left" | "right" | "top" | "bottom"
  /**
   * Width of the slide-over panel
   * @default "max-w-md"
   */
  width?: string
  className?: string
}

export const SlideOverDialog = React.forwardRef<
  HTMLDivElement,
  SlideOverDialogProps
>(({ open, onOpenChange, children, side = "right", width = "max-w-md", className }, ref) => {
  const variants = {
    left: {
      closed: { x: "-100%" },
      open: { x: 0 },
    },
    right: {
      closed: { x: "100%" },
      open: { x: 0 },
    },
    top: {
      closed: { y: "-100%" },
      open: { y: 0 },
    },
    bottom: {
      closed: { y: "100%" },
      open: { y: 0 },
    },
  }

  const positionClasses = {
    left: "left-0 top-0 h-full",
    right: "right-0 top-0 h-full",
    top: "left-0 right-0 top-0",
    bottom: "left-0 right-0 bottom-0",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <AnimatedDialogOverlay blurAmount={2} />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed z-50 gap-4 border bg-background p-6 shadow-lg",
            positionClasses[side],
            width,
            side === "top" || side === "bottom" ? "mx-auto" : "",
            className
          )}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={variants[side]}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-full"
              >
                {children}
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
})

SlideOverDialog.displayName = "SlideOverDialog"

/**
 * BottomSheetDialog - Mobile-friendly bottom sheet dialog
 */
export interface BottomSheetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /**
   * Height of the sheet (fraction of viewport)
   * @default 0.7
   */
  height?: number
  className?: string
}

export const BottomSheetDialog = React.forwardRef<
  HTMLDivElement,
  BottomSheetDialogProps
>(({ open, onOpenChange, children, height = 0.7, className }, ref) => {
  const sheetVariants = {
    closed: { y: "100%" },
    open: { y: 0 },
  }

  const handleDragEnd = (_: any, { offset, velocity }: any) => {
    if (offset.y > 100 || velocity.y > 500) {
      onOpenChange(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <DialogPortal>
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => onOpenChange(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 mx-auto max-h-[90vh] rounded-t-xl border bg-background p-6 shadow-lg",
              "md:max-w-md md:left-[50%] md:-translate-x-[50%]",
              className
            )}
            style={{ maxHeight: `${height * 100}vh` }}
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sheetVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="h-full overflow-y-auto"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  )
})

BottomSheetDialog.displayName = "BottomSheetDialog"

/**
 * AnimatedAlertDialog - Enhanced alert dialog with animations
 */
export interface AnimatedAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  /**
   * Confirm button text
   * @default "Confirm"
   */
  confirmText?: string
  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string
  /**
   * Action to perform on confirm
   */
  onConfirm: () => void
  /**
   * Variant of the confirm button
   * @default "destructive"
   */
  variant?: "destructive" | "default"
}

export const AnimatedAlertDialog = React.forwardRef<
  HTMLDivElement,
  AnimatedAlertDialogProps
>(({ open, onOpenChange, title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm, variant = "destructive" }, ref) => {
  const [isConfirming, setIsConfirming] = React.useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <AnimatedDialogOverlay blurAmount={4} />
        <DialogPrimitive.Content
          ref={ref}
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <AnimatedDialogHeader>
              <AnimatedDialogTitle>{title}</AnimatedDialogTitle>
              <AnimatedDialogDescription className="mt-2">
                {description}
              </AnimatedDialogDescription>
            </AnimatedDialogHeader>
            <AnimatedDialogFooter className="mt-4">
              <DialogPrimitive.Close
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "h-9 px-4 py-2 transition-colors",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {cancelText}
              </DialogPrimitive.Close>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={isConfirming}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "h-9 px-4 py-2 transition-colors",
                  "disabled:pointer-events-none disabled:opacity-50",
                  variant === "destructive"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isConfirming ? "Confirming..." : confirmText}
              </motion.button>
            </AnimatedDialogFooter>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
})

AnimatedAlertDialog.displayName = "AnimatedAlertDialog"
