/**
 * Hero Section
 *
 * Clean, focused hero with refined typography and minimal effects.
 * First impression - premium and purposeful.
 */

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Zap, Star } from 'lucide-react';
import { NotificationsDemo } from './NotificationsDemo';
import { AuthModal } from "@/components/ui/auth-modal";

const words = ['in sync.', 'shipping.', 'focused.', 'happy.'];

export function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-background flex items-center overflow-hidden"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px)`,
        backgroundSize: '60px 100%'
      }} />

      {/* Subtle mouse-following glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--foreground) / 0.04), transparent 50%)`,
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-24 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-secondary/50 border border-border/50"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
              <span className="text-xs font-medium text-foreground/70 tracking-wide">
                Open Source
              </span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground leading-[1.08] tracking-tight">
              Keep remote teams
              <br />
              <span className="relative inline-block min-h-[1.1em]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWord}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 text-foreground/50"
                  >
                    {words[currentWord]}
                  </motion.span>
                </AnimatePresence>
                <span className="text-foreground/50 opacity-0">{words[0]}</span>
              </span>
            </h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg text-muted-foreground max-w-md leading-relaxed"
            >
              The missing link for distributed teams. Track handoffs, get AI summaries, and never drop the ball across timezones.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <AuthModal
                triggerText="Get started free"
                redirectTo="/dashboard"
                triggerClassName="rounded-xl px-8 py-3.5 bg-foreground hover:bg-foreground/90 text-background h-auto font-medium text-sm tracking-tight transition-all hover:scale-[1.02] active:scale-[0.98]"
              />
              <a
                href="https://github.com/krockxz/TaskFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border text-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all"
              >
                <span>Star on GitHub</span>
                <Star className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Feature indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground/80 pt-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Drag & drop task reassignment</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Timezone-aware lanes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>AI-powered summaries</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Product Demo - No outer container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative lg:pl-8"
          >
            {/* Subtle decorative glow behind */}
            <div className="absolute -inset-8 bg-foreground/[0.02] rounded-3xl blur-3xl pointer-events-none" />

            {/* Notifications demo - clean, no extra border */}
            <div className="relative rounded-2xl bg-card/30 backdrop-blur-sm p-1">
              <NotificationsDemo className="scale-95 origin-top" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
