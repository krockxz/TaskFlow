/**
 * CTA Section - Vercel Design System
 *
 * Clean conversion section with monochrome palette and blur fade animations.
 */

'use client';

import { BlurFade } from '@/components/ui/blur-fade';

export function CTASection() {
  return (
    <section className="py-32 px-6 bg-secondary/50">
      <div className="max-w-4xl mx-auto text-center">
        <BlurFade inView delay={0} duration={0.5}>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-5 tracking-tight-vercel">
            Ready to coordinate across timezones?
          </h2>
        </BlurFade>

        <BlurFade inView delay={0.1} duration={0.5}>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Self-hosted and open source. Take control of your team&apos;s workflow.
          </p>
        </BlurFade>

        <BlurFade inView delay={0.2} duration={0.5}>
          <p className="text-sm text-muted-foreground/70">
            No credit card required · Free forever for small teams
          </p>
        </BlurFade>
      </div>
    </section>
  );
}
