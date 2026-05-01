'use client';

import { useMemo } from 'react';
import { User } from '@prisma/client';
import { Lane, type LaneTask } from './Lane';

interface TimezoneBoardProps {
  users: User[];
  tasks: LaneTask[];
  taskAssignments: Record<string, string>;
}

export function TimezoneBoard({ users, tasks, taskAssignments }: TimezoneBoardProps) {
  const { tasksByUser, unassignedTasks } = useMemo<{
    tasksByUser: Record<string, LaneTask[]>;
    unassignedTasks: LaneTask[];
  }>(() => {
    const userTasksMap = new Map<string, LaneTask[]>();
    const unassigned: LaneTask[] = [];

    for (const user of users) {
      userTasksMap.set(user.id, []);
    }

    for (const task of tasks) {
      const assigneeId = taskAssignments[task.id];
      if (!assigneeId) {
        unassigned.push(task);
      } else if (userTasksMap.has(assigneeId)) {
        userTasksMap.get(assigneeId)!.push(task);
      }
    }

    return {
      tasksByUser: Object.fromEntries(userTasksMap) as Record<string, LaneTask[]>,
      unassignedTasks: unassigned,
    };
  }, [users, tasks, taskAssignments]);

  const unassignedUser = useMemo(() => ({
    id: 'unassigned',
    email: 'Unassigned',
    timezone: null,
  }), []);

  return (
    <div className="flex gap-4 overflow-x-auto px-4 h-full">
      <Lane key="unassigned" user={unassignedUser} tasks={unassignedTasks} />
      {users.map((user) => (
        <Lane
          key={user.id}
          user={user}
          tasks={tasksByUser[user.id] || []}
        />
      ))}
    </div>
  );
}
