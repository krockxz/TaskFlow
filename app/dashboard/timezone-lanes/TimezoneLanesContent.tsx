'use client';

import { TimezoneBoard } from '@/components/lanes/TimezoneBoard';
import { Task, User } from '@prisma/client';

interface TimezoneLanesContentProps {
  users: User[];
  tasks: Task[];
}

export function TimezoneLanesContent({ users, tasks }: TimezoneLanesContentProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Timezone Lanes</h1>
        <p className="text-sm text-muted-foreground">
          Drag tasks between lanes to reassign work
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <TimezoneBoard users={users} tasks={tasks} />
      </div>
    </div>
  );
}
