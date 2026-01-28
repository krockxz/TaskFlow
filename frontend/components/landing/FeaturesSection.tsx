/**
 * Features Section - 2026 Minimalist
 *
 * Interactive FeatureCard components with single accent color.
 */

'use client';

import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Bell, Filter, Users, BarChart3, Zap } from 'lucide-react';
import { FeatureCard } from './';

const features = [
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Get instant alerts when tasks are assigned or status changes.',
    details: ['Push notifications for all events', '@mention teammates', 'Unread count badge'],
    accent: 'blue' as const,
    badge: 'Live',
  },
  {
    icon: Filter,
    title: 'Smart Filtering',
    description: 'Filter by status, priority, assignee, or date range.',
    details: ['Shareable filtered views', 'Save custom filters', 'Quick filter presets'],
    accent: 'blue' as const,
  },
  {
    icon: Users,
    title: 'Presence Indicators',
    description: 'See who is viewing each task right now.',
    details: ['Online status', 'Currently viewing', 'Activity feed'],
    accent: 'blue' as const,
  },
  {
    icon: BarChart3,
    title: 'Team Analytics',
    description: 'Visual insights into team workload and completion rates.',
    details: ['Workload balance', 'Completion trends', 'Per-user metrics'],
    accent: 'gray' as const,
    badge: 'Beta',
  },
  {
    icon: Zap,
    title: 'Bulk Operations',
    description: 'Update multiple tasks in one action.',
    details: ['Select multiple tasks', 'Bulk status change', 'Bulk reassignment'],
    accent: 'blue' as const,
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="features" className="py-20 px-6 bg-[#161b22]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-[#58a6ff26] text-[#58a6ff] text-sm font-mono-display mb-4">
            Features
          </span>
          <h2 className="text-3xl font-bold text-[#f0f6fc] mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-[#8b949e] max-w-2xl mx-auto">
            Powerful features that keep your distributed team aligned.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isInView ? 'reveal-stagger visible' : 'reveal-stagger'}`}>
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
