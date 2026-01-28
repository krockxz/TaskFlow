/**
 * FeatureCard - Interactive expandable card
 *
 * Hover effects, click to expand, state badges.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  details?: string[];
  accent?: 'blue' | 'green' | 'gray';
  badge?: string;
}

const accentColors = {
  blue: {
    icon: 'text-[#58a6ff]',
    bg: 'bg-[#58a6ff]',
    bgSoft: 'bg-[#58a6ff26]',
    border: 'border-[#58a6ff26]',
  },
  green: {
    icon: 'text-[#3fb950]',
    bg: 'bg-[#3fb950]',
    bgSoft: 'bg-[#3fb95026]',
    border: 'border-[#3fb95026]',
  },
  gray: {
    icon: 'text-[#8b949e]',
    bg: 'bg-[#8b949e]',
    bgSoft: 'bg-[#8b949e26]',
    border: 'border-[#30363d]',
  },
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  details,
  accent = 'blue',
  badge,
}: FeatureCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = accentColors[accent];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => details && setExpanded(!expanded)}
      className={`p-6 rounded-lg bg-[#161b22] ${colors.border} border cursor-pointer transition-all hover:border-[#484f58] group`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colors.bgSoft} ${colors.icon} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[#f0f6fc]">{title}</h3>
            {badge && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bgSoft} ${colors.icon}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-[#8b949e]">{description}</p>

          {details && expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-[#30363d] space-y-2"
            >
              {details.map((detail, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-[#c9d1d9]">
                  <span className="text-[#3fb950] mt-0.5">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {details && (
          <ChevronDown
            className={`w-5 h-5 text-[#484f58] transition-transform flex-shrink-0 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>
    </motion.div>
  );
}
