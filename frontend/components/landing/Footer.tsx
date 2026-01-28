/**
 * Footer - 2026 Minimalist
 *
 * Simplified 2-column footer.
 */

import { Zap, Github } from 'lucide-react';
import Link from 'next/link';

const links = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Documentation', href: '#' },
    { name: 'Changelog', href: '#' },
  ],
  resources: [
    { name: 'GitHub', href: 'https://github.com/kunal/TaskFlow' },
    { name: 'Contributing', href: '#' },
    { name: 'License', href: '#' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-6 bg-[#0d1117] border-t border-[#30363d]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono-display text-lg font-bold text-[#f0f6fc]">
                TaskFlow
              </span>
            </Link>
            <p className="mt-3 text-sm text-[#8b949e] max-w-xs">
              Async team coordination for modern distributed teams.
            </p>
          </div>

          {/* Links - 2 columns only */}
          <div>
            <h3 className="text-sm font-semibold text-[#f0f6fc] mb-3">Product</h3>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-[#8b949e] hover:text-[#58a6ff] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#f0f6fc] mb-3">Resources</h3>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-[#8b949e] hover:text-[#58a6ff] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#21262d] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#484f58]">
            © {currentYear} TaskFlow · MIT License
          </p>
          <a
            href="https://github.com/kunal/TaskFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
