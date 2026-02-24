/**
 * NewFeaturesSection - Vercel Design System
 *
 * Showcases product features with monochrome palette and subtle animations.
 * Features: Handoff Templates, AI Shift Brief, Timezone Lanes, Slack Integration, Self-Hosting
 */

'use client';

import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef } from 'react';
import { Copy, Sparkles, Globe, MessageSquare, Server } from 'lucide-react';
import { NumberTicker } from '@/components/ui/number-ticker';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
} as const;

const features = [
  {
    icon: Copy,
    title: 'Handoff Templates',
    description: 'Create reusable task templates with custom fields and validation. Standardize workflows.',
    stat: '80',
    suffix: '%',
    statLabel: 'time saved'
  },
  {
    icon: Sparkles,
    title: 'AI Shift Brief',
    description: 'Auto-generated summaries using Google Gemini 2.5 Flash Lite. Perfect async handoffs.',
    stat: '2',
    suffix: 'min',
    statLabel: 'generation time'
  },
  {
    icon: Globe,
    title: 'Timezone Lanes',
    description: 'Visual drag-drop lanes for reassigning tasks across timezones. See availability.',
    stat: '24',
    suffix: '/7',
    statLabel: 'global coverage'
  },
  {
    icon: MessageSquare,
    title: 'Slack Integration',
    description: 'OAuth integration for notifications and task updates. Stay in sync in Slack.',
    stat: '5',
    suffix: 's',
    statLabel: 'notification delivery'
  },
  {
    icon: Server,
    title: 'Self-Hosting',
    description: 'Docker support for on-premise deployment. Full control over data and infrastructure.',
    stat: '100',
    suffix: '%',
    statLabel: 'data ownership'
  }
];

// Demo data for timezone lanes visualization
type DemoTask = {
  id: string;
  title: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
};

const demoTasks: DemoTask[] = [
  { id: '1', title: 'Fix API auth bug', status: 'In Progress', priority: 'high' },
  { id: '2', title: 'Update dashboard UI', status: 'Todo', priority: 'medium' },
  { id: '3', title: 'Review PR #142', status: 'Done', priority: 'low' },
  { id: '4', title: 'Write unit tests', status: 'In Progress', priority: 'high' },
  { id: '5', title: 'Deploy to staging', status: 'Todo', priority: 'medium' },
];

const demoTimezones = [
  { id: 't1', name: 'San Francisco', offset: '-8:00', tasks: ['1', '3'] },
  { id: 't2', name: 'London', offset: '+0:00', tasks: ['2'] },
  { id: 't3', name: 'Singapore', offset: '+8:00', tasks: ['4', '5'] },
];

// Animated Task Card Component
const DemoTaskCard = ({ task, index }: { task: DemoTask; index: number }) => (
  <motion.div
    variants={itemVariants}
    className="bg-card border border-border rounded-lg p-3 mb-2 cursor-pointer hover:border-foreground/30 transition-colors"
  >
    <div className="flex items-start gap-3">
      <div className="w-4 h-4 rounded border border-border mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate font-medium">{task.title}</p>
        <span className="text-xs text-muted-foreground">{task.status}</span>
      </div>
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
          task.priority === 'high' ? 'bg-foreground' :
          task.priority === 'medium' ? 'bg-foreground/50' : 'bg-foreground/20'
        }`}
      />
    </div>
  </motion.div>
);

// Timezone Lane Column Component
const TimezoneLane = ({ timezone, tasks }: {
  timezone: typeof demoTimezones[0];
  tasks: DemoTask[];
}) => (
  <motion.div
    variants={itemVariants}
    className="flex-1 min-w-[200px] bg-secondary/30 border border-border rounded-xl p-4"
  >
    <div className="flex items-center gap-2 mb-4">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <div>
        <h4 className="text-sm font-medium text-foreground">{timezone.name}</h4>
        <p className="text-xs text-muted-foreground">UTC{timezone.offset}</p>
      </div>
    </div>

    <div className="space-y-2">
      {tasks.map((task) => (
        <DemoTaskCard key={task.id} task={task} index={tasks.indexOf(task)} />
      ))}
    </div>
  </motion.div>
);

// Feature Card Component
const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => (
  <motion.div
    variants={itemVariants}
    className="group relative bg-card rounded-xl border border-border p-6 hover:border-foreground/20 transition-colors duration-300"
  >
    {/* Icon */}
    <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:border-foreground transition-colors duration-300">
      <feature.icon className="w-6 h-6 text-foreground group-hover:text-background transition-colors duration-300" />
    </div>

    {/* Title & Description */}
    <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
      {feature.title}
    </h3>
    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
      {feature.description}
    </p>

    {/* Stat with NumberTicker */}
    <div className="flex items-center gap-2 pt-4 border-t border-border">
      <motion.span
        className="text-xl font-semibold text-foreground"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + (index * 0.05), type: "spring", stiffness: 150 }}
      >
        <NumberTicker value={parseInt(feature.stat)} />
        {feature.suffix}
      </motion.span>
      <span className="text-xs text-muted-foreground">{feature.statLabel}</span>
    </div>
  </motion.div>
);

// Main Component
export function NewFeaturesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-6 tracking-tight-vercel">
            Everything you need to coordinate async teams
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Powerful features that keep your distributed team aligned, productive, and always in sync—no matter where they are.
          </p>
        </motion.div>

        {/* Timezone Lanes Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-1">Timezone Lanes</h3>
            <p className="text-sm text-muted-foreground">Visual drag-drop interface for task reassignment across timezones</p>
          </div>

          <motion.div
            className="relative rounded-xl border border-border bg-secondary/20 p-6 overflow-hidden"
          >
            <motion.div
              className="flex gap-4 overflow-x-auto pb-2 relative"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <AnimatePresence mode="popLayout">
                {demoTimezones.map((tz) => {
                  const zoneTasks = demoTasks.filter(t => tz.tasks.includes(t.id));
                  return (
                    <TimezoneLane
                      key={tz.id}
                      timezone={tz}
                      tasks={zoneTasks}
                    />
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
