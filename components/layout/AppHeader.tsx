/**
 * AppHeader Component
 *
 * Universal header that adapts based on authentication status.
 * Shows theme toggle on all pages.
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Github, Menu, X, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/auth/oauth-helpers';

// Extracted Logo component (DRY principle)
// Extracted Logo component (DRY principle)
function Logo({ href }: { href: string }) {
    return (
        <Link href={href} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                <img
                    src="/logo.jpg"
                    alt="TaskFlow Logo"
                    className="object-cover w-full h-full"
                />
            </div>
            <span className="font-mono-display text-lg font-bold tracking-tight">TaskFlow</span>
        </Link>
    );
}

// Command Palette keyboard shortcut hint
function CommandKHint() {
    return (
        <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))}
            className="hidden sm:flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
            title="Press ⌘K to open command palette"
        >
            <span className="font-medium opacity-70 text-[9px]">⌘</span>
            <span className="opacity-70">K</span>
        </button>
    );
}

export function AppHeader() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const handleLogout = async () => {
        const { error } = await signOut();
        if (!error) {
            // Update state immediately for smooth UX
            setIsAuthenticated(false);
            setUserEmail('');
            // Navigate and refresh server components
            startTransition(() => {
                router.push('/');
                router.refresh();
            });
        }
    };

    useEffect(() => {
        setMounted(true);
        const supabase = createClient();

        // Initial auth check
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsAuthenticated(!!user);
            setUserEmail(user?.email || '');
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setIsAuthenticated(!!session?.user);
            setUserEmail(session?.user?.email || '');
        });

        return () => subscription.unsubscribe();
    }, []);

    // Prevent hydration mismatch - show minimal skeleton
    if (!mounted) {
        return (
            <nav className="sticky top-0 z-50 mt-4 mx-4 sm:mx-6">
                <div className="max-w-3xl mx-auto">
                    <div className="h-10 rounded-full border border-border/50 bg-background/80 backdrop-blur-md shadow-sm flex items-center px-3">
                        <Logo href="/" />
                    </div>
                </div>
            </nav>
        );
    }

    // Extract user initials for minimal display
    const userInitials = userEmail
        ?.split('@')[0]
        .split('.')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <nav className="sticky top-0 z-50 mt-4 mx-4 sm:mx-6 transition-all duration-300 hover:shadow-md">
            <div className="max-w-3xl mx-auto">
                <div className="h-10 rounded-full border border-border/50 bg-background/80 backdrop-blur-md shadow-sm flex items-center justify-between px-2.5 sm:px-3.5 transition-all duration-300 hover:border-border/80">
                    <Logo href={isAuthenticated ? '/dashboard' : '/'} />

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
                        {isAuthenticated && <CommandKHint />}
                        {isAuthenticated ? (
                            <>
                                <ThemeToggle className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted/50 transition-colors" />
                                <NotificationBell />
                                <div className="h-4 w-px bg-border/50" />
                                <button
                                    onClick={handleLogout}
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                                    title="Sign out"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline font-medium">{userInitials}</span>
                                            <LogOut className="h-3 w-3" />
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="https://github.com/kunal/TaskFlow"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-full hover:bg-muted/50"
                                >
                                    <Github className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">GitHub</span>
                                </a>
                                <ThemeToggle className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted/50 transition-colors" />
                                <Link href="/login">
                                    <Button size="sm" className="h-7 px-3 rounded-full text-[11px] font-medium">
                                        Get started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="md:hidden mt-2 mx-auto max-w-3xl"
                    >
                        <div className="rounded-2xl border border-border/50 bg-background/95 backdrop-blur-md shadow-lg p-3.5 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                        <span className="text-xs text-muted-foreground">Theme</span>
                                        <ThemeToggle className="text-muted-foreground hover:text-foreground p-1.5" />
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                        <span className="text-xs text-muted-foreground">Notifications</span>
                                        <NotificationBell />
                                    </div>
                                    <div className="h-px bg-border/60" />
                                    <div className="text-xs text-muted-foreground px-2 truncate">{userEmail}</div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full gap-2 justify-start rounded-xl h-9 text-xs"
                                        onClick={handleLogout}
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                                        Sign out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <a
                                        href="https://github.com/krockxz/TaskFlow"
                                        className="block p-2 rounded-xl text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 text-xs"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <Github className="w-3.5 h-3.5" />
                                        GitHub
                                    </a>
                                    <div className="h-px bg-border/60" />
                                    <div className="flex items-center justify-between p-2 rounded-xl">
                                        <span className="text-xs text-muted-foreground">Theme</span>
                                        <ThemeToggle className="text-muted-foreground hover:text-foreground p-1.5" />
                                    </div>
                                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                                        <Button size="sm" className="w-full rounded-xl h-9 text-xs">Get started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
