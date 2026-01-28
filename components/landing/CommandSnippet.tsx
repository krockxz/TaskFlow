/**
 * CommandSnippet - Copyable one-line install command
 *
 * Click to copy with success feedback.
 */

'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CommandSnippetProps {
  command: string;
  label?: string;
}

export function CommandSnippet({ command, label = 'npm install' }: CommandSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <button
        onClick={handleCopy}
        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-[#484f58] transition-all w-full sm:w-auto"
        aria-label={`Copy ${command}`}
      >
        <span className="text-[#8b949e] text-sm font-mono-display">$</span>
        <span className="flex-1 text-left text-[#c9d1d9] font-mono-display text-sm">
          {command}
        </span>
        {copied ? (
          <Check className="w-4 h-4 text-[#3fb950]" />
        ) : (
          <Copy className="w-4 h-4 text-[#484f58] group-hover:text-[#8b949e] transition-colors" />
        )}
      </button>
    </div>
  );
}
