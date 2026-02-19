/**
 * Problem Section - Vercel Design System
 *
 * Before/After comparison with monochrome palette and subtle borders.
 * Now with blur fade scroll animations.
 */

'use client';

import { SplitView } from './SplitView';
import { BlurFade } from '@/components/ui/blur-fade';

export function ProblemSection() {
  return (
    <section className="py-32 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <BlurFade inView delay={0} duration={0.5}>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1.5 rounded-full bg-secondary border border-border text-foreground/60 text-xs font-medium tracking-tight-vercel mb-6">
              The Problem
            </span>
            <h2 className="text-4xl font-semibold text-foreground mb-5 tracking-tight-vercel">
              Async teamwork is broken
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Modern tools weren&apos;t built for distributed teams. See the difference.
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
