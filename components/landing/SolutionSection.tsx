/**
 * Solution Section - Vercel Design System
 *
 * Simplified, focused explanation with monochrome palette.
 * Now with proper scroll-triggered Framer Motion animations.
 */

'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { ScrollReveal } from '.';

export function SolutionSection() {
  const benefits = [
    'Everything in one place',
    'Always know who owns what',
    'Smooth handoffs with full context',
    'Works while you sleep',
  ];

  const workflowSteps = ['Create', 'Assign', 'Notify', 'Track'];

  return (
    <section className="py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <ScrollReveal>
              <div>
                <span className="inline-block px-3 py-1.5 rounded-full bg-secondary border border-border text-foreground/60 text-xs font-medium tracking-tight-vercel mb-6">
                  The Solution
                </span>
                <h2 className="text-4xl font-semibold text-foreground mb-6 tracking-tight-vercel">
                  Built for how teams actually work
                </h2>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  TaskFlow gives your distributed team a single source of truth. No more digging through chat, no more confusion about ownership.
                </p>
              </div>
            </ScrollReveal>

            {/* Benefits list with stagger animation */}
            <div>
              {benefits.map((benefit, index) => (
                <ScrollReveal
                  key={benefit}
                  staggerIndex={index}
                  staggerDelay={0.08}
                  direction="left"
                  distance={20}
                  className="flex items-center gap-3 text-foreground mb-4 last:mb-0"
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (index * 0.08), type: 'spring', stiffness: 200 }}
                  >
                    <Check className="w-3 h-3 text-background" strokeWidth={3} />
                  </motion.div>
                  {benefit}
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right: Workflow visual */}
          <ScrollReveal delay={0.15} direction="right" distance={30}>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {workflowSteps.map((step, i) => (
                <div key={step} className="flex items-center">
                  <motion.div
                    className="px-5 py-2.5 rounded-lg bg-secondary border border-border text-foreground font-mono-display text-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: 0.25 + (i * 0.1), duration: 0.4 }}
                    whileHover={{ y: -2, scale: 1.05 }}
                  >
                    {step}
                  </motion.div>
                  {i < workflowSteps.length - 1 && (
                    <motion.div
                      className="w-8 h-px bg-border hidden sm:block"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + (i * 0.1), duration: 0.3 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
