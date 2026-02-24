/**
 * Problem Section - Premium code comparison
 *
 * Clean, refined before/after comparison with subtle syntax highlighting.
 */

'use client';

import { useInView } from 'motion/react';
import { useRef } from 'react';
import { X, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface CodeLine {
  code: string;
  comment?: string;
  delay?: number;
}

const beforeCode: CodeLine[] = [
  { code: 'const task = await findTask()', delay: 0 },
  { code: '  .dig("slack")', delay: 0.06 },
  { code: '  .search("who owns this?")', delay: 0.12 },
  { code: '  .maybe("email thread?")', delay: 0.18 },
  { code: '  .catch("guess");', delay: 0.24 },
  { code: '', delay: 0.3 },
  { code: '// Result: hours wasted', delay: 0.36, comment: 'bad' },
];

const afterCode: CodeLine[] = [
  { code: 'const task = await taskflow.get("id");', delay: 0.5 },
  { code: 'console.log(task.assignedTo); // "maria@"', delay: 0.56 },
  { code: 'console.log(task.status);    // "in_progress"', delay: 0.62 },
  { code: 'console.log(task.handoffTo);  // "yuki@"', delay: 0.68 },
  { code: '', delay: 0.74 },
  { code: '// Result: instant clarity', delay: 0.8, comment: 'good' },
];

// Syntax highlight helper
function highlightSyntax(line: string) {
  const parts: { text: string; className: string }[] = [];

  // Keywords
  const keywords = ['const', 'await', 'async', 'function', 'return'];
  let remaining = line;

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    if (regex.test(remaining)) {
      const split = remaining.split(regex);
      parts.push({ text: split[0], className: 'text-foreground/70' });
      parts.push({ text: keyword, className: 'text-foreground/90 font-medium' });
      remaining = split.slice(1).join(keyword);
    }
  }

  if (remaining) {
    // Strings
    const stringMatch = remaining.match(/"([^"]*)"/);
    if (stringMatch) {
      const beforeString = remaining.split(stringMatch[0])[0];
      if (beforeString) parts.push({ text: beforeString, className: 'text-foreground/70' });
      parts.push({ text: stringMatch[0], className: 'text-emerald-400/80' });
      const afterString = remaining.split(stringMatch[0]).slice(1).join(stringMatch[0]);
      if (afterString) parts.push({ text: afterString, className: 'text-foreground/70' });
    } else {
      // Comments
      if (remaining.includes('//')) {
        const [code, comment] = remaining.split('//');
        if (code) parts.push({ text: code, className: 'text-foreground/70' });
        parts.push({ text: '//', className: 'text-foreground/40 italic' });
        parts.push({ text: comment, className: 'text-foreground/40 italic' });
      } else {
        parts.push({ text: remaining, className: 'text-foreground/70' });
      }
    }
  }

  return parts;
}

function CodeLine({ line, lineIndex }: { line: CodeLine; lineIndex: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: line.delay || 0, duration: 0.4 }}
      className="font-mono-display text-sm leading-relaxed"
    >
      {line.code ? (
        <span>
          {highlightSyntax(line.code).map((part, i) => (
            <span key={i} className={part.className}>
              {part.text}
            </span>
          ))}
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </motion.div>
  );
}

export function ProblemSection() {
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
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border/50 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
            <span className="text-xs font-medium text-foreground/60 tracking-wide">
              The Problem
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight mb-6">
            Async teamwork is{' '}
            <span className="text-foreground/50">broken</span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Modern tools weren&apos;t built for distributed teams.
          </p>
        </motion.div>

        {/* Code comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="sticky top-8">
              {/* Label */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Without TaskFlow</p>
                  <p className="text-xs text-muted-foreground">The chaos</p>
                </div>
              </div>

              {/* Code block */}
              <div className="rounded-xl bg-card border border-border p-6 space-y-1">
                {beforeCode.map((line, i) => (
                  <CodeLine key={i} line={line} lineIndex={i} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="sticky top-8">
              {/* Label */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">With TaskFlow</p>
                  <p className="text-xs text-muted-foreground">The clarity</p>
                </div>
              </div>

              {/* Code block */}
              <div className="rounded-xl bg-card border border-emerald-500/20 p-6 relative overflow-hidden">
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none" />
                <div className="relative space-y-1">
                  {afterCode.map((line, i) => (
                    <CodeLine key={i} line={line} lineIndex={i} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
