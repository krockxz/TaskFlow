/**
 * Solution Section
 *
 * Editorial brutalist approach with asymmetric layout
 * and abstract workflow visualization.
 *
 * Distinctive elements:
 * - Large bracket-style step indicators instead of icons
 * - Diagonal slash decorations for brutalist edge
 * - Number-based navigation (01, 02, 03, 04) for visual rhythm
 * - Split-color technique on headline for contrast
 */

'use client';

import { motion, useInView } from 'motion/react';
import { memo, useRef, useState, useCallback, useMemo } from 'react';

const steps = ['Draft', 'Assign', 'Sync', 'Track'] as const;

// Abstract workflow node component
const WorkflowNode = memo(function WorkflowNode({
  label,
  index,
  delay,
  isActive,
  onHover
}: {
  label: string;
  index: number;
  delay: number;
  isActive: boolean;
  onHover: (index: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      onPointerEnter={() => onHover(index)}
    >
      <div
        className={`transition-all duration-500 ${
          isActive
            ? 'bg-foreground text-background scale-[1.02]'
            : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
        }`}
        style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <span className="font-mono-display text-[10px] tracking-[0.2em] uppercase opacity-40">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className={`w-1.5 h-1.5 ${
              isActive ? 'bg-background' : 'bg-foreground/20'
            }`} />
          </div>
          <span className="font-mono-display text-sm tracking-wide">
            {label}
          </span>
        </div>
      </div>

      {/* Corner accent for active state */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-foreground"
        />
      )}
    </motion.div>
  );
});

// Feature pill with distinctive styling
const FeaturePill = memo(function FeaturePill({
  number,
  text,
  delay
}: {
  number: string;
  text: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 text-sm text-muted-foreground group"
    >
      <span className="font-mono-display text-[10px] tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">
        {number}
      </span>
      <span className="w-px h-3 bg-foreground/10" />
      <span className="group-hover:text-foreground transition-colors">{text}</span>
    </motion.div>
  );
});

function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [activeStep, setActiveStep] = useState(0);

  const handleStepHover = useCallback((index: number) => {
    setActiveStep(index);
  }, []);

  const progressPercent = useMemo(() =>
    ((activeStep + 1) / steps.length) * 100,
    [activeStep]
  );

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Diagonal slash decoration - brutalist edge */}
      <div className="absolute top-20 right-0 w-32 h-[1px] bg-foreground/10 rotate-12 origin-right" />
      <div className="absolute top-24 right-0 w-24 h-[1px] bg-foreground/10 rotate-12 origin-right" />

      {/* Subtle background grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px)`,
        backgroundSize: '60px 100%'
      }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Section label - positioned absolutely for asymmetry */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="absolute -top-8 -left-6 hidden lg:block"
        >
          <span className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground/40">
            Solution
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left column - asymmetric span */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Brutalist decorative element - three lines */}
              <div className="flex gap-2 mb-8">
                <div className="h-px w-8 bg-foreground/30" />
                <div className="h-px w-4 bg-foreground/15" />
                <div className="h-px w-2 bg-foreground/10" />
              </div>

              {/* Headline - split-color with brutalist emphasis */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight mb-8">
                How teams<br />
                <span className="relative">
                  <span className="text-foreground/40">actually work</span>
                  {/* Diagonal strike-through for brutalist edge */}
                  <svg className="absolute -top-1 -left-1 w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="200" y2="40" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                  </svg>
                </span>
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-12 max-w-md">
                TaskFlow creates a single source of truth for distributed teams—eliminating chat fatigue and ownership ambiguity.
              </p>

              {/* Feature pills - simplified with numbers instead of icons */}
              <div className="flex flex-col gap-4">
                <FeaturePill number="01" text="Global teams" delay={0.3} />
                <FeaturePill number="02" text="Async-first" delay={0.35} />
                <FeaturePill number="03" text="Instant sync" delay={0.4} />
              </div>
            </motion.div>
          </div>

          {/* Right column - workflow visualization */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Abstract workflow visualization with cut corners */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-lg mx-auto lg:mx-0">
                {steps.map((step, i) => (
                  <WorkflowNode
                    key={step}
                    label={step}
                    index={i}
                    delay={0.3 + (i * 0.08)}
                    isActive={activeStep === i}
                    onHover={handleStepHover}
                  />
                ))}
              </div>

              {/* Minimal progress indicator */}
              <div className="mt-12 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-mono-display text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40">
                    {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                  </span>
                  <motion.span
                    key={activeStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono-display text-sm text-foreground/80"
                  >
                    {steps[activeStep]}
                  </motion.span>
                </div>
                {/* Brutalist progress bar - sharp corners, no rounding */}
                <div className="h-[2px] bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full bg-foreground"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Decorative bracket accent */}
              <div className="absolute -bottom-8 -right-4 hidden md:block">
                <svg width="48" height="48" viewBox="0 0 48 48" className="text-foreground/5">
                  <path
                    d="M 32 8 L 40 8 L 40 16 M 40 32 L 40 40 L 32 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom accent line - asymmetric */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent mt-24 origin-center"
        />
      </div>
    </section>
  );
}

export { SolutionSection, steps };
