'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShiftBriefSlideover } from './ShiftBriefSlideover';

/**
 * Shift Brief button component.
 *
 * Opens a slideover/dialog that displays an AI-generated summary
 * of recent task activity for async handoffs.
 */
export function ShiftBriefButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Wand2 className="mr-2 h-4 w-4" />
        Shift Brief
      </Button>
      <ShiftBriefSlideover open={open} onOpenChange={setOpen} />
    </>
  );
}
