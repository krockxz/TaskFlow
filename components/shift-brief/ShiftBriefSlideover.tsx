'use client';

import { useChat } from 'ai/react';
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
 * Displays an AI-generated summary of recent task activity.
 * Uses streaming to show the response token-by-token as it's generated.
 *
 * Features:
 * - Streaming response via Vercel AI SDK useChat hook
 * - Safe markdown rendering with rehype-sanitize (prevents XSS)
 * - GitHub-flavored markdown support via remark-gfm
 * - Loading states and error handling
 */
export function ShiftBriefSlideover({ open, onOpenChange }: ShiftBriefSlideoverProps) {
  const { messages, handleSubmit, isLoading, error } = useChat({
    api: '/api/shift-brief',
    initialMessages: [],
    body: { timeframe: '24h' },
  });

  const handleGenerate = () => {
    handleSubmit(undefined);
  };

  // Reset messages when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Clear messages when closing
      messages.length = 0;
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
          {messages.length === 0 && !error && (
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
                <p className="text-sm opacity-90 mt-1">
                  {error.message || 'Please check your connection and try again.'}
                </p>
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

          {messages.map((message) => (
            <div key={message.id} className="prose max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ))}

          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Generating summary...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
