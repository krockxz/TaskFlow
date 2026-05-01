/**
 * AuthLayout Component
 *
 * Shared layout for authentication pages with a lightweight split-screen design.
 */

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-gradient-to-br from-primary/8 via-background to-background border-r border-border/60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_520px_at_50%_40%,rgba(120,119,198,0.08),transparent)]" />

        <div className="relative z-10 max-w-md text-center space-y-5">
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
            TaskFlow
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Streamline your workflow. Organize tasks. Boost productivity.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['Task Management', 'Team Collaboration', 'Real-time Sync'].map(
              (feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full bg-background/70 border border-border/70 text-sm font-medium text-foreground/80"
                >
                  {feature}
                </span>
              )
            )}
          </div>
        </div>
      </aside>

      <main className="flex w-full lg:w-1/2 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {alternateLink.text}{' '}
            <Link
              href={alternateLink.href}
              className="font-medium text-primary hover:underline transition-colors"
            >
              {alternateLink.linkText}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
