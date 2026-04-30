'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Loader2, AlertCircle, Sparkles, Wand2, Zap, Brain,
  CheckCircle2, Clock, Eye, AlertTriangle, Activity
} from 'lucide-react';

interface ShiftBriefSlideoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Custom components for ReactMarkdown to provide a premium, themed look.
 */
const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => {
    const text = children?.toString() || '';
    let Icon = Activity;
    if (text.toLowerCase().includes('completed')) Icon = CheckCircle2;
    if (text.toLowerCase().includes('progress')) Icon = Clock;
    if (text.toLowerCase().includes('review')) Icon = Eye;
    if (text.toLowerCase().includes('attention')) Icon = AlertTriangle;
    
    return (
      <h2 className="flex items-center gap-2.5 text-base font-bold text-foreground mt-8 mb-4 first:mt-0 pb-2 border-b border-border/50">
        <div className="p-1 rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        {children}
      </h2>
    );
  },
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-muted-foreground leading-relaxed mb-4 last:mb-0">{children}</p>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex items-start gap-2 mb-2 last:mb-0 text-muted-foreground">
      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-6 mt-2 space-y-1 list-none p-0">{children}</ul>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
};

/**
 * Shift Brief slideover/dialog component.
 *
 * Displays an AI-generated summary of recent task activity using Google Gemini.
 * Uses Server-Sent Events (SSE) for streaming the response.
 */
export function ShiftBriefSlideover({ open, onOpenChange }: ShiftBriefSlideoverProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setContent('');
    setHasGenerated(true);

    try {
      const response = await fetch('/api/shift-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: '24h' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to generate: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) setContent((prev) => prev + parsed.text);
              if (parsed.error) throw new Error(parsed.error);
            } catch (e) {
              continue;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setContent('');
      setError(null);
      setHasGenerated(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 border-none shadow-2xl ring-1 ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <DialogHeader className="p-6 pb-0 relative z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Brain className="h-5 w-5" />
             </div>
             <div className="flex flex-col">
               <DialogTitle className="text-xl font-bold tracking-tight">Shift Brief</DialogTitle>
               <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">AI-Powered Summary</p>
             </div>
          </div>
        </DialogHeader>

        <div className="p-6 relative z-10">
          {/* Initial State */}
          {!hasGenerated && !error && (
            <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl border bg-muted/30 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative p-4 rounded-full bg-background border shadow-sm text-primary">
                    <Sparkles className="h-10 w-10" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">Ready for your summary?</h3>
                <p className="text-muted-foreground text-sm max-w-[280px] mb-8 leading-relaxed">
                  We&apos;ll analyze your recent activity and generate a concise brief of your progress and key updates.
                </p>
                
                <Button 
                  onClick={handleGenerate} 
                  disabled={isLoading}
                  size="lg"
                  className="px-10 h-12 text-sm font-semibold rounded-full bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-primary/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4 fill-primary-foreground" />
                      Generate Brief
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Failed to generate shift brief</p>
                <p className="text-sm opacity-90 mt-1">{error.message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Content State */}
          {content && (
            <div className="rounded-2xl border bg-card/30 p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={markdownComponents}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Loading Indicator (for streaming) */}
          {isLoading && !error && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Generating summary...</span>
            </div>
          )}

          {/* Footer Actions */}
          {hasGenerated && !isLoading && !error && (
            <div className="flex justify-center pt-2">
              <Button 
                onClick={handleGenerate} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
                className="rounded-full px-6 border-primary/20 hover:bg-primary/5"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Wand2 className="mr-2 h-3.5 w-3.5" />
                Regenerate Brief
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
