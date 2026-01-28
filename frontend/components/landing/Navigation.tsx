/**
 * Navigation - 2026 Minimalist
 *
 * Simplified nav with sticky mobile GitHub button.
 */

'use client';

import { motion } from 'motion/react';
import { Zap, Github, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
          scrolled ? 'bg-[#0d1117]/80 backdrop-blur-md border-b border-[#30363d]' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono-display text-lg font-bold text-[#f0f6fc]">
                TaskFlow
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
                Features
              </a>
              <a
                href="https://github.com/kunal/TaskFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#8b949e] hover:text-[#f0f6fc] transition-colors flex items-center gap-1.5"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <Link href="/login" className="text-sm text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-medium transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#8b949e] hover:text-[#f0f6fc]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-[#30363d] bg-[#0d1117]"
          >
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-[#c9d1d9]" onClick={() => setMobileOpen(false)}>
                Features
              </a>
              <a
                href="https://github.com/kunal/TaskFlow"
                className="block text-[#c9d1d9] flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <Link
                href="/login"
                className="block text-[#8b949e]"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="block px-4 py-2 bg-[#238636] text-white rounded-md text-center font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Mobile sticky GitHub button */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <a
          href="https://github.com/kunal/TaskFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm font-medium shadow-lg"
        >
          <Github className="w-4 h-4" />
          Star on GitHub
        </a>
      </div>
    </>
  );
}
