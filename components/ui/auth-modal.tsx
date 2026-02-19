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
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState<string | null>(null)

    const container: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        show: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: "easeInOut",
                staggerChildren: 0.05
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    const socialButtons = [
        { icon: GitHubIcon, provider: "github" as OAuthProvider },
    ]

    const handleOAuthLogin = async (provider: OAuthProvider) => {
        setIsLoading(true)
        setError(null)

        const { error } = await signInWithOAuth(provider, { redirectTo })

        if (error) {
            setError(error)
            setIsLoading(false)
        }
        // OAuth redirect happens automatically
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address")
            setIsLoading(false)
            return
        }

        const { error } = await signInWithMagicLink(email, { redirectTo })

        if (error) {
            setError(error)
        } else {
            setMessage("Check your email for the magic link!")
            setEmail("")
        }
        setIsLoading(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "inline-flex h-10 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    triggerClassName
                )}
            >
                {triggerText}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />

                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="relative w-full max-w-[360px] overflow-hidden rounded-3xl bg-background p-6 shadow-2xl border border-border"
                        >
                            <div className="absolute right-4 top-4">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <motion.div variants={item} className="mb-8 text-center">
                                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                    Welcome to TaskFlow
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Sign in to your account to continue
                                </p>
                            </motion.div>

                            {error && (
                                <motion.div variants={item} className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <p className="text-sm text-destructive">{error}</p>
                                </motion.div>
                            )}

                            {message && (
                                <motion.div variants={item} className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
                                </motion.div>
                            )}

                            <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-8">
                                {socialButtons.map((btn) => (
                                    <button
                                        key={btn.provider}
                                        onClick={() => handleOAuthLogin(btn.provider)}
                                        disabled={isLoading}
                                        className={cn(
                                            "flex aspect-square items-center justify-center rounded-2xl border border-border bg-card transition-all hover:scale-105 active:scale-95 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                        )}
                                        aria-label={`Sign in with ${btn.provider}`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <btn.icon className="h-5 w-5" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>

                            <motion.div variants={item} className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with email
                                    </span>
                                </div>
                            </motion.div>

                            <motion.div variants={item}>
                                <form onSubmit={handleEmailAuth}>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            disabled={isLoading}
                                            className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-10 text-sm outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !email}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground transition-transform hover:scale-95 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <ArrowRight className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>

                            <motion.div variants={item} className="mt-8 text-center">
                                <p className="text-xs text-muted-foreground">
                                    By clicking continue, you agree to our{" "}
                                    <a href="#" className="underline hover:text-foreground">
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a href="#" className="underline hover:text-foreground">
                                        Privacy Policy
                                    </a>
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}

export { AuthModal, type AuthModalProps }
