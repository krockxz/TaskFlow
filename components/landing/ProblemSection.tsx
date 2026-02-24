/**
 * Problem Section - Enhanced code comparison section
 *
 * Features animated heading, typewriter code effects, and syntax highlighting.
 */

'use client';

import { SplitView } from './SplitView';
import { BlurFade } from '@/components/ui/blur-fade';
import { motion } from 'motion/react';

export function ProblemSection() {
  return (
    <section className="py-32 px-6 bg-secondary/30 relative overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-foreground/[0.02] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <BlurFade inView delay={0} duration={0.5}>
          <div className="text-center mb-20">
            <motion.span
              className="inline-block px-3 py-1.5 rounded-full bg-secondary border border-border text-foreground/60 text-xs font-medium tracking-tight-vercel mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              The Problem
            </motion.span>

            <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-6 tracking-tight-vercel">
              <span className="inline-block">Async teamwork </span>
              <motion.span
                className="inline-block text-gradient"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 100%',
                  backgroundImage: 'linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 50%, hsl(var(--foreground)) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                is broken
              </motion.span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Modern tools weren&apos;t built for distributed teams.
            </p>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.15} duration={0.6}>
          <SplitView
            beforeLabel="Without TaskFlow"
            beforeCode={`// Lost in Slack threads
const task = await findTask()
  .dig('slack')
  .search('who owns this?')
  .maybe('email thread?')
  .catch('guess');

// Result: hours wasted`}
            afterLabel="With TaskFlow"
            afterCode={`// Clear ownership & handoffs
const task = await taskflow.get('id');
console.log(task.assignedTo); // "maria@"
console.log(task.status);    // "in_progress"
console.log(task.handoffTo);  // "yuki@"

// Result: instant clarity`}
          />
        </BlurFade>
      </div>
    </section>
  );
}
