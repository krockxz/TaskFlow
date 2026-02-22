/**
 * Hero Section - Vercel Design System
 *
 * Clean, focused hero with monochrome palette and subtle borders.
 */

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { NotificationsDemo } from './NotificationsDemo';
import { AuthModal } from "@/components/ui/auth-modal";

const words = ['synchronized.', 'productive.', 'organized.', 'efficient.'];

export function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentWord((prev) => (prev + 1) % words.length);
        setIsExiting(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-background flex items-center">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-pattern opacity-[0.4]" />

      <div className="max-w-6xl mx-auto px-6 py-32 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Badge - monochrome */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border"
            >
              <span className="text-xs font-medium text-muted-foreground tracking-tight-vercel">
                Open Source
              </span>
            </motion.div>

            {/* Main headline - high contrast black with animated word */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground leading-[1.1] tracking-tight-vercel">
              Async teams,
              <br />
              <span className="relative inline-block min-h-[1.1em]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWord}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 text-gradient"
                  >
                    {words[currentWord]}
                  </motion.span>
                </AnimatePresence>
                <span className="text-gradient opacity-0">{words[0]}</span>
              </span>
            </h1>

            {/* Subheading - dark gray */}
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Track handoffs across timezones. AI-powered summaries for async teams.
            </p>

            {/* CTA - Black primary button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <AuthModal
                triggerText="Get started free"
                triggerClassName="!rounded-lg px-8 py-3.5 bg-foreground hover:bg-foreground/90 text-background !h-auto font-medium text-sm tracking-tight transition-transform hover:scale-[1.02] active:scale-[0.98]"
                redirectTo="/dashboard"
              />
            </motion.div>

            {/* Social proof / trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Real-time sync</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Self-hosted</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Open source</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Product Screenshot - subtle border with animated beam */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-xl bg-card border border-border overflow-hidden relative">
              {/* Animated border beam effect */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-foreground/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />
              </motion.div>

              {/* Screenshot placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-background to-secondary flex items-center justify-center p-8">
                {/* Dashboard preview using NotificationsDemo */}
                <div className="space-y-3 relative h-[300px] overflow-hidden w-full">
                  <NotificationsDemo className="scale-90 origin-top p-0 bg-transparent min-h-0" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none scale-90 origin-bottom" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
