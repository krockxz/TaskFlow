/**
 * Solution Section - How it works
 *
 * Simplified, focused explanation.
 */

'use client';

import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check } from 'lucide-react';

export function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const benefits = [
    'Everything in one place',
    'Always know who owns what',
    'Smooth handoffs with full context',
    'Works while you sleep',
  ];

  return (
    <section ref={ref} className="py-20 px-6 bg-[#0d1117]">
      <div className={`max-w-6xl mx-auto ${isInView ? 'reveal visible' : 'reveal'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#3fb95026] text-[#3fb950] text-sm font-mono-display mb-4">
              The Solution
            </span>
            <h2 className="text-3xl font-bold text-[#f0f6fc] mb-6">
              Built for how teams actually work
            </h2>
            <p className="text-lg text-[#8b949e] mb-8">
              TaskFlow gives your distributed team a single source of truth. No more digging through chat, no more confusion about ownership.
            </p>

            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-[#c9d1d9]">
                  <Check className="w-5 h-5 text-[#3fb950] flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Simple workflow visual */}
          <div className="flex items-center justify-center gap-4">
            {['Create', 'Assign', 'Notify', 'Track'].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="px-4 py-2 rounded bg-[#161b22] border border-[#30363d] text-[#58a6ff] font-mono-display text-sm">
                  {step}
                </div>
                {i < 3 && (
                  <div className="w-8 h-px bg-[#30363d]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
