/**
 * Problem Section - Split view comparison
 *
 * Before/After code comparison instead of cards.
 */

'use client';

import { SplitView } from './';

export function ProblemSection() {
  return (
    <section className="py-20 px-6 bg-[#161b22]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-[#f8514926] text-[#f85149] text-sm font-mono-display mb-4">
            The Problem
          </span>
          <h2 className="text-3xl font-bold text-[#f0f6fc] mb-4">
            Async teamwork is broken
          </h2>
          <p className="text-lg text-[#8b949e] max-w-2xl mx-auto">
            Modern tools weren&apos;t built for distributed teams. See the difference.
          </p>
        </div>

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
      </div>
    </section>
  );
}
