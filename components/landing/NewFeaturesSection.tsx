/**
 * NewFeaturesSection
 *
 * Clean feature showcase with refined typography and minimal design.
 */

'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Copy, Sparkles, Globe, MessageSquare, Server, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Copy,
    title: 'Handoff Templates',
    description: 'Standardize your workflow with reusable templates. Every handoff follows the same process, every time.',
    stat: '80%',
    label: 'time saved'
  },
  {
    icon: Sparkles,
    title: 'AI Shift Briefs',
    description: 'Get caught up in seconds. AI summarizes what happened while you slept—no more scrolling through threads.',
    stat: '~2 min',
    label: 'to catch up'
  },
  {
    icon: Globe,
    title: 'Timezone-Aware',
    description: 'See who\'s online and when. Reassign tasks across timezones without the back-and-forth.',
    stat: '24/7',
    label: 'coverage'
  },
  {
    icon: MessageSquare,
    title: 'Slack Sync',
    description: 'Updates where you already are. Get notified and respond to tasks without leaving Slack.',
    stat: '< 5s',
    label: 'delivery'
  },
  {
    icon: Server,
    title: 'Your Data, Your Rules',
    description: 'Self-host with Docker. Keep everything on your own servers if you need to.',
    stat: '100%',
    label: 'ownership'
  }
];

// Feature Card Component
const FeatureCard = ({
  feature,
  index
}: {
  feature: typeof features[0];
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
    className="group relative"
  >
    <div className="h-full p-6 rounded-2xl border border-border/50 hover:border-foreground/20 transition-colors duration-300">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center mb-5 group-hover:bg-foreground/10 transition-colors">
        <feature.icon className="w-5 h-5 text-foreground/70" />
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-foreground mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {feature.description}
      </p>

      {/* Stat */}
      <div className="flex items-center gap-2 pt-4 border-t border-border/50">
        <span className="text-lg font-mono-display text-foreground">{feature.stat}</span>
        <span className="text-xs text-muted-foreground">{feature.label}</span>
      </div>
    </div>
  </motion.div>
);

export function NewFeaturesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px)`,
        backgroundSize: '60px 100%'
      }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 mb-8">
            <div className="w-1 h-1 rounded-full bg-foreground/40" />
            <span className="text-xs font-medium text-foreground/60 tracking-wide">
              Features
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight mb-6">
            Everything remote teams need
          </h2>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Stop fighting against your tools. TaskFlow works the way distributed teams actually work—async, across timezones, by default.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-20 text-center"
        >
          <a
            href="https://github.com/krockxz/TaskFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Explore all features on GitHub</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
