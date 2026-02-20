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
import { Loader2, AlertCircle } from 'lucide-react';

interface ShiftBriefSlideoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Shift Brief slideover/dialog component.
 *
 * Displays an AI-generated summary of recent task activity using Google Gemini.
 * Uses Server-Sent Events (SSE) for streaming the response.
 *
 * Features:
 * - Custom SSE parsing implementation using fetch and ReadableStream
 * - Safe markdown rendering with rehype-sanitize (prevents XSS)
 * - GitHub-flavored markdown support via remark-gfm
 * - Loading states and error handling
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeframe: '24h' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to generate: ${response.statusText}`);
      }

      // Read the streaming SSE response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE events (format: "data: {...}\n\n")
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove "data: " prefix

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setContent((prev) => prev + parsed.text);
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Skip invalid JSON
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

  // Reset state when dialog closes
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shift Brief</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!hasGenerated && !error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Get an AI summary of recent task activity
              </p>
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Brief
              </Button>
            </div>
          )}

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

          {content && (
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {isLoading && !error && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Generating summary...</span>
            </div>
          )}

          {hasGenerated && !isLoading && !error && (
            <div className="flex justify-center pt-4">
              <Button onClick={handleGenerate} variant="outline" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
