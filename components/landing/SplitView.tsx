/**
 * SplitView - Enhanced before/after code comparison
 *
 * Features typewriter effect, syntax highlighting, and line-by-line animation.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplitViewProps {
  beforeLabel: string;
  beforeCode: string;
  afterLabel: string;
  afterCode: string;
}

// Syntax token types
type TokenType = 'keyword' | 'string' | 'comment' | 'function' | 'number' | 'operator' | 'plain';

interface Token {
  text: string;
  type: TokenType;
}

// Simple syntax highlighter for JavaScript-like code
function highlightCode(code: string, isProblem: boolean): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      tokens.push({ text: '\n', type: 'plain' });
      continue;
    }

    // Comments
    if (trimmed.startsWith('//')) {
      tokens.push({ text: line + '\n', type: 'comment' });
      continue;
    }

    let pos = 0;

    while (pos < line.length) {
      // Check for string literals
      if (line[pos] === '"' || line[pos] === "'") {
        const quote = line[pos];
        const end = line.indexOf(quote, pos + 1);
        if (end !== -1) {
          tokens.push({ text: line.slice(pos, end + 1), type: 'string' });
          pos = end + 1;
          continue;
        }
      }

      // Check for keywords
      const keywords = ['const', 'await', 'async', 'function', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'new', 'class', 'import', 'export', 'from', 'default'];
      const keywordMatch = line.slice(pos).match(/^(\w+)(?=\W|$)/);
      if (keywordMatch && keywords.includes(keywordMatch[1])) {
        tokens.push({ text: keywordMatch[1], type: 'keyword' });
        pos += keywordMatch[1].length;
        continue;
      }

      // Check for function calls
      const funcMatch = line.slice(pos).match(/^(\w+)(?=\()/);
      if (funcMatch) {
        tokens.push({ text: funcMatch[1], type: 'function' });
        pos += funcMatch[1].length;
        continue;
      }

      // Check for numbers
      if (/\d/.test(line[pos])) {
        const numMatch = line.slice(pos).match(/^\d+/);
        if (numMatch) {
          tokens.push({ text: numMatch[0], type: 'number' });
          pos += numMatch[0].length;
          continue;
        }
      }

      // Check for operators
      if (['.', '(', ')', '{', '}', '[', ']', ';', ':', ',', '=', '+', '-', '*', '/', '!', '?', '>', '<'].includes(line[pos])) {
        tokens.push({ text: line[pos], type: 'operator' });
        pos++;
        continue;
      }

      // Plain text
      tokens.push({ text: line[pos], type: 'plain' });
      pos++;
    }

    tokens.push({ text: '\n', type: 'plain' });
  }

  return tokens;
}

// Token color classes
const tokenColors = {
  keyword: 'text-purple-600 dark:text-purple-400',
  string: 'text-emerald-600 dark:text-emerald-400',
  comment: 'text-foreground/40 italic',
  function: 'text-blue-600 dark:text-blue-400',
  number: 'text-orange-600 dark:text-orange-400',
  operator: 'text-foreground/70',
  plain: 'text-foreground/80',
};

function TypewriterCode({ tokens, delay = 0, isProblem = false }: { tokens: Token[]; delay?: number; isProblem: boolean }) {
  const [visibleTokens, setVisibleTokens] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    const startTime = Date.now() + delay * 1000;
    let tokenIndex = 0;
    let charIndex = 0;
    let animationFrame: number;

    const animate = () => {
      const now = Date.now();
      if (now < startTime) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      // Guard against undefined tokens
      if (!tokens || tokens.length === 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      // Calculate total characters shown
      const elapsed = now - startTime;
      const charsPerSecond = isProblem ? 8 : 12; // Problem types slower
      const targetChars = Math.floor(elapsed / 1000 * charsPerSecond * 15);

      // Count total characters in tokens
      let totalChars = 0;
      let lastTokenIndex = 0;
      for (let i = 0; i < tokens.length; i++) {
        totalChars += tokens[i]?.text?.length || 0;
        if (totalChars >= targetChars) {
          lastTokenIndex = i;
          break;
        }
        lastTokenIndex = tokens.length;
      }

      setVisibleTokens(lastTokenIndex + 1);

      // Calculate current line for cursor position
      let charCount = 0;
      let lineNum = 0;
      for (let i = 0; i < Math.min(lastTokenIndex + 1, tokens.length); i++) {
        const tokenText = tokens[i]?.text || '';
        for (const char of tokenText) {
          if (char === '\n') lineNum++;
          charCount++;
        }
      }
      setCurrentLine(lineNum);

      if (lastTokenIndex < tokens.length - 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [tokens, delay, isProblem]);

  const visibleTokensList = tokens?.slice(0, visibleTokens) || [];
  const hasMore = visibleTokens < (tokens?.length || 0);

  return (
    <div className="relative">
      <pre className="whitespace-pre-wrap overflow-x-auto">
        {visibleTokensList.map((token, i) => (
          <span key={i} className={tokenColors[token?.type || 'plain']}>
            {token?.text || ''}
          </span>
        ))}
        {hasMore && (
          <motion.span
            className="inline-block w-2 h-4 bg-foreground/60 align-middle ml-0.5"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </pre>
    </div>
  );
}

export function SplitView({ beforeLabel, beforeCode, afterLabel, afterCode }: SplitViewProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const beforeTokens = highlightCode(beforeCode, true);
  const afterTokens = highlightCode(afterCode, false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Before - Problem side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-foreground/30"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-sm font-medium text-muted-foreground">{beforeLabel}</span>
        </div>
        <div className="rounded-lg bg-card border border-border p-5 font-mono-display text-sm relative overflow-hidden group">
          {/* Subtle diagonal stripe pattern for "problem" feel */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
              color: 'inherit'
            }} />
          </div>
          <div className="relative">
            <TypewriterCode tokens={beforeTokens} delay={0.3} isProblem />
          </div>
        </div>
      </motion.div>

      {/* After - Solution side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-emerald-500"
            animate={{ boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0)', '0 0 0 8px rgba(16, 185, 129, 0)', '0 0 0 0 rgba(16, 185, 129, 0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm font-medium text-foreground">{afterLabel}</span>
        </div>
        <div className="rounded-lg bg-card border border-emerald-500/20 p-5 font-mono-display text-sm relative overflow-hidden">
          {/* Subtle success glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative">
            <TypewriterCode tokens={afterTokens} delay={1.8} isProblem={false} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
