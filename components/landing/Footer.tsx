/**
 * Footer - Vercel Design System with hover effects
 *
 * Minimal footer with monochrome palette and animated links.
 */

'use client';

import { Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { HoverLink } from '@/components/ui/hover-link';

const links = {
  product: [
    { name: 'Features', href: '#features' },
  ],
  resources: [
    { name: 'GitHub', href: 'https://github.com/krockxz/TaskFlow' },
    { name: 'License', href: '#' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-6 bg-background border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.jpg"
                  alt="TaskFlow Logo"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="font-mono-display text-lg font-semibold text-foreground tracking-tight">
                TaskFlow
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Async team coordination for modern distributed teams.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Product</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <HoverLink href={link.href} showArrow={false}>
                    {link.name}
                  </HoverLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Resources</h3>
            <ul className="space-y-3">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <HoverLink href={link.href} showArrow={false}>
                    {link.name}
                  </HoverLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground/70">
            © {currentYear} TaskFlow
          </p>
          <a
            href="https://github.com/krockxz/TaskFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Github className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
