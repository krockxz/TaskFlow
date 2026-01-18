/**
 * NewTaskButton Component
 *
 * Simple button to create a new task using shadcn Button.
 */

'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewTaskButton() {
  return (
    <Button asChild>
      <Link href="/tasks/new">
        <Plus className="h-4 w-4" />
        New Task
      </Link>
    </Button>
  );
}
