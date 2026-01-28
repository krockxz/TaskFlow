/**
 * Hero Section - 2026 Minimalist Design
 *
 * Clean, focused hero with product screenshot and single CTA.
 */

'use client';

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CommandSnippet } from './CommandSnippet';
import { StatGrid } from './';

export function HeroSection() {
  const stats = [
    { label: 'GitHub Stars', value: '2.4k' },
    { label: 'Active Teams', value: '500+' },
    { label: 'Open Issues', value: '12' },
  ];

  return (
    <section className="relative min-h-screen bg-[#0d1117] flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Badge - simplified */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d]"
            >
              <span className="text-sm font-mono-display text-[#8b949e]">
                Open Source • MIT Licensed
              </span>
            </motion.div>

            {/* Main headline - reduced size */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#f0f6fc] leading-tight tracking-tight">
              Async teams,
              <br />
              <span className="text-[#58a6ff]">synchronized.</span>
            </h1>

            {/* Subheading - reduced size */}
            <p className="text-lg text-[#8b949e] max-w-lg leading-relaxed">
              Track handoffs across timezones. Get notified when tasks move forward.
            </p>

            {/* Single CTA - remove secondary buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-semibold transition-colors"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Command snippet with copy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CommandSnippet command="npm install taskflow" />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <StatGrid stats={stats} />
            </motion.div>
          </motion.div>

          {/* Right: Product Screenshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-lg bg-[#161b22] border border-[#30363d] overflow-hidden shadow-2xl">
              {/* Screenshot placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-[#161b22] to-[#0d1117] flex items-center justify-center p-8">
                <div className="w-full">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#30363d]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#30363d]" />
                      <div className="w-3 h-3 rounded-full bg-[#30363d]" />
                      <div className="w-3 h-3 rounded-full bg-[#30363d]" />
                    </div>
                    <div className="flex-1 mx-4 h-2 bg-[#30363d] rounded-full max-w-xs" />
                  </div>
                  {/* Dashboard preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[#f0f6fc] font-semibold">Your Tasks</h3>
                      <span className="text-xs text-[#8b949e] font-mono-display">5 active</span>
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded bg-[#0d1117] border border-[#30363d]">
                        <div className="w-4 h-4 rounded border-2 border-[#484f58]" />
                        <div className="flex-1 h-3 bg-[#30363d] rounded w-48" />
                        <div className="h-5 bg-[#58a6ff26] text-[#58a6ff] text-xs px-2 py-1 rounded font-mono-display">
                          {['OPEN', 'PROGRESS', 'REVIEW', 'DONE'][i - 1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
