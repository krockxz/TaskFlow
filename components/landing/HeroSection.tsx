/**
 * Hero Section - Vercel Design System
 *
 * Clean, focused hero with monochrome palette and subtle borders.
 */

'use client';

import { motion } from 'motion/react';
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal";
import { NotificationsDemo } from './NotificationsDemo';
import { AuthModal } from "@/components/ui/auth-modal";

export function HeroSection() {
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

            {/* Main headline - high contrast black */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground leading-[1.1] tracking-tight-vercel">
              Async teams,
              <br />
              <span className="text-gradient">synchronized.</span>
            </h1>

            {/* Subheading - dark gray */}
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Track handoffs across timezones. Get notified when tasks move forward.
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

            {/* Command snippet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Terminal>
                <TypingAnimation>npm install taskflow@latest</TypingAnimation>
                <AnimatedSpan delay={1500} className="text-foreground/70">
                  <span>✔ Installed successfully.</span>
                </AnimatedSpan>
              </Terminal>
            </motion.div>
          </motion.div>

          {/* Right: Product Screenshot - subtle border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              {/* Screenshot placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-background to-secondary flex items-center justify-center p-8">
                {/* Dashboard preview using NotificationsDemo */}
                <div className="space-y-3 relative h-[300px] overflow-hidden w-full">
                  <NotificationsDemo className="scale-90 origin-top p-0 bg-transparent min-h-0" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
