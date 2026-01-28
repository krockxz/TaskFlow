/**
 * StatGrid - Animated counter stats
 *
 * Social proof with animated numbers.
 */

'use client';

import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Github, Users, AlertCircle } from 'lucide-react';

interface StatProps {
  label: string;
  value: string;
  link?: string;
}

function Stat({ label, value, link }: StatProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView && value.match(/\d+/)) {
      const num = parseInt(value);
      const duration = 1500;
      const steps = 30;
      const stepValue = num / steps;
      const stepDuration = duration / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += stepValue;
        if (current >= num) {
          setCount(num);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  const displayValue = value.match(/\d+/) ? count + value.replace(/\d+/, '') : value;

  return (
    <div
      ref={ref}
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#161b22] border border-[#30363d]"
    >
      <Github className="w-4 h-4 text-[#8b949e]" />
      <div>
        <div className="text-lg font-semibold text-[#f0f6fc] tabular-nums">{displayValue}</div>
        <div className="text-xs text-[#8b949e]">{label}</div>
      </div>
    </div>
  );
}

interface StatGridProps {
  stats: StatProps[];
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {stats.map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </div>
  );
}
