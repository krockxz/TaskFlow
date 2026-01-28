/**
 * Stats Section - 2026 Minimalist
 *
 * Simplified stats section - can be removed or merged into hero.
 */

'use client';

import { motion } from 'motion/react';
import { Github, Star, Users } from 'lucide-react';

export function StatsSection() {
  const stats = [
    { value: '500+', label: 'Teams' },
    { value: '50+', label: 'Countries' },
    { value: '10K+', label: 'Tasks' },
  ];

  return (
    <section className="py-16 px-6 bg-[#0d1117] border-y border-[#30363d]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#f0f6fc] font-mono-display tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm text-[#8b949e] mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
