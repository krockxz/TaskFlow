/**
 * AppHeader Component
 *
 * Universal header that adapts based on authentication status.
 * Shows theme toggle on all pages.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Github, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';

// Extracted Logo component (DRY principle)
function Logo({ href }: { href: string }) {
    return (
        <Link href={href} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-mono-display text-lg font-bold">TaskFlow</span>
        </Link>
    );
}

export function AppHeader() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

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
            <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Logo href="/" />
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Logo href={isAuthenticated ? '/dashboard' : '/'} />

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                <ThemeToggle className="text-muted-foreground hover:text-foreground p-2" />
                                <Separator orientation="vertical" className="h-6" />
                                <NotificationBell />
                                <Separator orientation="vertical" className="h-6" />
                                <span className="text-sm text-muted-foreground">{userEmail}</span>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href="/api/auth/logout">Sign out</a>
                                </Button>
                            </>
                        ) : (
                            <>
                                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Features
                                </a>
                                <a
                                    href="https://github.com/kunal/TaskFlow"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                                >
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </a>
                                <ThemeToggle className="text-muted-foreground hover:text-foreground p-2" />
                                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Sign in
                                </Link>
                                <Link href="/login">
                                    <Button size="sm">Get started</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t bg-background"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Theme</span>
                                        <ThemeToggle className="text-muted-foreground hover:text-foreground p-2" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Notifications</span>
                                        <NotificationBell />
                                    </div>
                                    <div className="text-sm text-muted-foreground">{userEmail}</div>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <a href="/api/auth/logout">Sign out</a>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <a href="#features" className="block text-foreground" onClick={() => setMobileOpen(false)}>
                                        Features
                                    </a>
                                    <a
                                        href="https://github.com/kunal/TaskFlow"
                                        className="block text-foreground flex items-center gap-2"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <Github className="w-4 h-4" />
                                        GitHub
                                    </a>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Theme</span>
                                        <ThemeToggle className="text-muted-foreground hover:text-foreground p-2" />
                                    </div>
                                    <Link href="/login" className="block text-muted-foreground" onClick={() => setMobileOpen(false)}>
                                        Sign in
                                    </Link>
                                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                                        <Button size="sm" className="w-full">Get started</Button>
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
