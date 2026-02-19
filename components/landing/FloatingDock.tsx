/**
 * Floating Dock - MacOS-style navigation dock
 *
 * Fixed position at bottom center of viewport with glass morphism.
 * Contains quick links to GitHub, Documentation, and other resources.
 */

'use client';

import Link from 'next/link';
import { Github, BookOpen, MessageSquare, FileText } from 'lucide-react';
import { Dock, DockIcon } from '@/components/ui/dock';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

const ITEMS = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/krockxz/TaskFlow',
    external: true,
  },
  {
    icon: BookOpen,
    label: 'Documentation',
    href: '/docs',
    external: false,
  },
  {
    icon: MessageSquare,
    label: 'Changelog',
    href: '/changelog',
    external: false,
  },
  {
    icon: FileText,
    label: 'License',
    href: '/license',
    external: false,
  },
];

export function FloatingDock() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Dock
          direction="middle"
          className="supports-backdrop-blur:bg-background/60 supports-backdrop-blur:dark:bg-background/60 border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl"
          iconSize={40}
          iconMagnification={55}
          iconDistance={140}
        >
          {ITEMS.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="flex aspect-square items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors"
                    >
                      <item.icon className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className="flex aspect-square items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors"
                    >
                      <item.icon className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
                    </Link>
                  )}
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-medium">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
        </Dock>
      </div>
    </TooltipProvider>
  );
}
