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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline"
        className="relative overflow-hidden group border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-sm px-4"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" 
          aria-hidden="true"
        />
        <Wand2 className="mr-2 h-4 w-4 text-primary group-hover:rotate-12 transition-transform duration-300" />
        <span className="relative z-10">Shift Brief</span>
      </Button>

      <ShiftBriefSlideover 
        open={isOpen} 
        onOpenChange={setIsOpen} 
      />
    </>
  );
}
