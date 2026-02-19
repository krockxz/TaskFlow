/**
 * Animated Components
 *
 * A collection of reusable animated components built with Framer Motion.
 * All components are client-side only and include smooth transitions and interactions.
 */

// Page Transitions
export {
  PageTransition,
  useRouteChange,
  TransitionDirection,
  type PageTransitionProps,
} from "./page-transition"

// Animated Button
export {
  AnimatedButton,
  AnimatedButtonGroup,
  IconAnimatedButton,
  RippleButton,
  type AnimatedButtonProps,
  type AnimatedButtonGroupProps,
  type IconAnimatedButtonProps,
  type RippleButtonProps,
} from "./animated-button"

// Animated Input
export {
  AnimatedInput,
  AnimatedTextarea,
  FloatingLabelInput,
  type AnimatedInputProps,
  type AnimatedTextareaProps,
  type FloatingLabelInputProps,
} from "./animated-input"

// Animated Card
export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardContent,
  AnimatedCardFooter,
  ExpandableCard,
  CardGrid,
  type AnimatedCardProps,
  type ExpandableCardProps,
  type CardGridProps,
} from "./animated-card"

// Animated Dialog
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
  SlideOverDialog,
  BottomSheetDialog,
  AnimatedAlertDialog,
  type SlideOverDialogProps,
  type BottomSheetDialogProps,
  type AnimatedAlertDialogProps,
} from "./animated-dialog"

// Loading States
export {
  Spinner,
  SpinnerWithLabel,
  LoadingDots,
  BarLoader,
  PulseLoader,
  SkeletonWrapper,
  PageLoader,
  ProgressLoader,
  InlineLoader,
  type SpinnerProps,
  type SpinnerWithLabelProps,
  type LoadingDotsProps,
  type BarLoaderProps,
  type PulseLoaderProps,
  type SkeletonWrapperProps,
  type PageLoaderProps,
  type ProgressLoaderProps,
  type InlineLoaderProps,
} from "./loading-states"

// Feedback Animations
export {
  SuccessCheckmark,
  ErrorX,
  ShakeAnimation,
  SlideInToast,
  ProgressToast,
  Confetti,
  BounceIn,
  TypewriterText,
  type SuccessCheckmarkProps,
  type ErrorXProps,
  type ShakeAnimationProps,
  type SlideInToastProps,
  type ProgressToastProps,
  type ConfettiProps,
  type BounceInProps,
  type TypewriterTextProps,
} from "./feedback-animations"
