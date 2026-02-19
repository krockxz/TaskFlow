/**
 * AuthLayout Component
 *
 * Shared layout for authentication pages with split-screen design.
 * Features animated background pattern and visual accent panel.
 */

'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  alternateLink: {
    href: string;
    text: string;
    linkText: string;
  };
}

export function AuthLayout({
  children,
  title,
  description,
  alternateLink,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Visual Accent */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden flex items-center justify-center p-8"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Animated Grid */}
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '24px 24px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,rgba(120,119,198,0.1),transparent)]"
        />

        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-4">
              TaskFlow
            </h1>
            <p className="text-lg text-muted-foreground">
              Streamline your workflow. Organize tasks. Boost productivity.
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            {['Task Management', 'Team Collaboration', 'Real-time Sync'].map(
              (feature, index) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 text-sm font-medium"
                >
                  {feature}
                </motion.span>
              )
            )}
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-24 h-24 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
        />
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </motion.div>

          {children}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            {alternateLink.text}{' '}
            <Link
              href={alternateLink.href}
              className="font-medium text-primary hover:underline transition-colors"
            >
              {alternateLink.linkText}
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
