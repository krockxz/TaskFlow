/**
 * NewTaskButton Component
 *
 * Simple button to create a new task.
 */

'use client';

import Link from 'next/link';

export function NewTaskButton() {
  return (
    <Link
      href="/tasks/new"
      className="btn btn-primary"
    >
      New Task
    </Link>
  );
}
