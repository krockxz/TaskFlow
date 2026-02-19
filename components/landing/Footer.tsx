/**
 * Footer - Vercel Design System
 *
 * Minimal footer with monochrome palette.
 */

import { Zap, Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const links = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Documentation', href: '#' },
    { name: 'Changelog', href: '#' },
  ],
  resources: [
    { name: 'GitHub', href: 'https://github.com/krockxz/TaskFlow' },
    { name: 'Contributing', href: '#' },
    { name: 'License', href: '#' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-6 bg-background border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand - monochrome logo */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
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

          {/* Links - 2 columns only */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Product</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Resources</h3>
            <ul className="space-y-3">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
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
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
