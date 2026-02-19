"use client"

import * as React from "react"
import { motion, AnimatePresence, type Variants } from "motion/react"
import { X, Mail, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { signInWithOAuth, signInWithMagicLink, type OAuthProvider } from "@/lib/auth/oauth-helpers"
import { GitHubIcon } from "@/components/auth/oauth-icons"

interface AuthModalProps {
    /**
     * The text to display on the trigger button
     */
    triggerText?: string
    /**
     * Optional className for the trigger button
     */
    triggerClassName?: string
    /**
     * Where to redirect after successful auth
     */
    redirectTo?: string
}

function AuthModal({
    triggerText = "Sign up / Sign in",
    triggerClassName,
    redirectTo = "/dashboard"
}: AuthModalProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [email, setEmail] = React.useState("")
    const [isLoading, setIsLoading] = React.useState<string | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState<string | null>(null)

    const container: Variants = {
        hidden: { opacity: 0, scale: 0.96, y: 10 },
        show: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        exit: {
            opacity: 0,
            scale: 0.96,
            y: 10,
            transition: {
                duration: 0.2,
                ease: [0.4, 0, 1, 1]
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }

    const socialButtons = [
        { icon: GitHubIcon, provider: "github" as OAuthProvider, label: "GitHub" },
    ]

    const handleOAuthLogin = async (provider: OAuthProvider) => {
        setIsLoading(provider)
        setError(null)

        const { error } = await signInWithOAuth(provider, { redirectTo })

        if (error) {
            setError(error)
            setIsLoading(null)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading("email")
        setError(null)
        setMessage(null)

        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address")
            setIsLoading(null)
            return
        }

        const { error } = await signInWithMagicLink(email, { redirectTo })

        if (error) {
            setError(error)
        } else {
            setMessage("Check your inbox for the magic link!")
            setEmail("")
        }
        setIsLoading(null)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    triggerClassName
                )}
            >
                {triggerText}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-[380px] overflow-hidden rounded-2xl bg-background border border-border shadow-xl"
                            >
                                {/* Close button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                <div className="p-8">
                                    {/* Header */}
                                    <motion.div variants={item} className="mb-8 text-center">
                                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                            Get started with TaskFlow
                                        </h2>
                                        <p className="mt-1.5 text-sm text-muted-foreground">
                                            Sign in to track your team&apos;s handoffs
                                        </p>
                                    </motion.div>

                                    {/* Error message */}
                                    {error && (
                                        <motion.div
                                            variants={item}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                                        >
                                            <p className="text-sm text-destructive">{error}</p>
                                        </motion.div>
                                    )}

                                    {/* Success message */}
                                    {message && (
                                        <motion.div
                                            variants={item}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                                        >
                                            <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
                                        </motion.div>
                                    )}

                                    {/* Social login - centered single button */}
                                    <motion.div variants={item} className="flex justify-center mb-6">
                                        <button
                                            onClick={() => handleOAuthLogin("github")}
                                            disabled={isLoading !== null}
                                            className={cn(
                                                "flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-all hover:bg-muted hover:border-border/80 active:scale-[0.98]",
                                                isLoading !== null && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isLoading === "github" ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <GitHubIcon className="h-4 w-4" />
                                            )}
                                            <span>Continue with GitHub</span>
                                        </button>
                                    </motion.div>

                                    {/* Divider */}
                                    <motion.div variants={item} className="relative mb-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2.5 text-muted-foreground/70">
                                                or
                                            </span>
                                        </div>
                                    </motion.div>

                                    {/* Email input */}
                                    <motion.div variants={item}>
                                        <form onSubmit={handleEmailAuth}>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Enter your email"
                                                    disabled={isLoading !== null}
                                                    autoFocus
                                                    className={cn(
                                                        "h-12 w-full rounded-xl border border-input bg-background pl-11 pr-14 text-sm",
                                                        "outline-none transition-all",
                                                        "focus:border-ring focus:ring-2 focus:ring-ring/20",
                                                        "placeholder:text-muted-foreground/50",
                                                        "disabled:opacity-50"
                                                    )}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isLoading !== null || !email}
                                                    className={cn(
                                                        "absolute right-2 top-1/2 -translate-y-1/2",
                                                        "rounded-lg h-8 px-3",
                                                        "flex items-center justify-center gap-1.5",
                                                        "bg-foreground text-background text-sm font-medium",
                                                        "transition-all",
                                                        "hover:opacity-90 active:scale-95",
                                                        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                                                    )}
                                                >
                                                    {isLoading === "email" ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span>Continue</span>
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>

                                    {/* Terms */}
                                    <motion.div variants={item} className="mt-6 text-center">
                                        <p className="text-xs text-muted-foreground/60">
                                            By continuing, you agree to our{" "}
                                            <a href="#" className="underline hover:text-foreground transition-colors">
                                                Terms
                                            </a>{" "}
                                            and{" "}
                                            <a href="#" className="underline hover:text-foreground transition-colors">
                                                Privacy Policy
                                            </a>
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export { AuthModal, type AuthModalProps }
