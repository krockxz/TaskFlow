/**
 * SplitView - Before/After comparison component
 *
 * Side-by-side code comparison for problem/solution.
 */

'use client';

interface SplitViewProps {
  beforeLabel: string;
  beforeCode: string;
  afterLabel: string;
  afterCode: string;
}

export function SplitView({ beforeLabel, beforeCode, afterLabel, afterCode }: SplitViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Before */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-[#f85149]" />
          <span className="text-sm font-medium text-[#8b949e]">{beforeLabel}</span>
        </div>
        <div className="rounded-lg bg-[#0d1117] border border-[#f8514950] p-4 font-mono-display text-sm">
          <pre className="text-[#f85149] whitespace-pre-wrap overflow-x-auto">
            {beforeCode}
          </pre>
        </div>
      </div>

      {/* After */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
          <span className="text-sm font-medium text-[#8b949e]">{afterLabel}</span>
        </div>
        <div className="rounded-lg bg-[#0d1117] border border-[#3fb95050] p-4 font-mono-display text-sm">
          <pre className="text-[#3fb950] whitespace-pre-wrap overflow-x-auto">
            {afterCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
