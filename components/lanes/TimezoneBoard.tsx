'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Task, User } from '@prisma/client';
import { Lane } from './Lane';
import { useToast } from '@/lib/hooks/use-toast';

interface TimezoneBoardProps {
  users: User[];
  tasks: Task[];
}

export function TimezoneBoard({ users, tasks }: TimezoneBoardProps) {
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>(
    Object.fromEntries(tasks.map(t => [t.id, t.assignedTo || '']))
  );

  const { success, error } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const newAssigneeId = over.id as string;
    const oldAssigneeId = taskAssignments[taskId];

    if (oldAssigneeId === newAssigneeId) return;

    // Optimistic update
    setTaskAssignments(prev => ({
      ...prev,
      [taskId]: newAssigneeId,
    }));

    try {
      const response = await fetch('/api/tasks/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, assignedTo: newAssigneeId }),
      });

      if (!response.ok) throw new Error('Failed to reassign task');

      success('Task reassigned successfully');
    } catch (err) {
      // Rollback on error
      setTaskAssignments(prev => ({
        ...prev,
        [taskId]: oldAssigneeId,
      }));
      error('Failed to reassign task');
    }
  };

  // Group tasks by assigned user
  const tasksByUser = users.reduce((acc, user) => {
    acc[user.id] = tasks.filter(
      t => taskAssignments[t.id] === user.id
    );
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {users.map((user) => (
          <Lane
            key={user.id}
            user={user}
            tasks={tasksByUser[user.id] || []}
          />
        ))}
      </DndContext>
    </div>
  );
}
