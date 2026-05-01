'use client';

import { useMemo, useState } from 'react';
import { closestCorners, DndContext, DragCancelEvent, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { TimezoneBoard } from '@/components/lanes/TimezoneBoard';
import { UnifiedTaskCard } from '@/components/tasks/TaskCard';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { LaneTask } from '@/components/lanes/Lane';

interface TimezoneLanesContentProps {
  users: {
    id: string;
    email: string;
    timezone: string | null;
  }[];
  tasks: {
    id: string;
    title: string;
    status: string | null;
    priority: string | null;
    dueDate: Date | null;
    assignedTo: string | null;
    githubIssueNumber: number | null;
  }[];
}

export function TimezoneLanesContent({ users, tasks }: TimezoneLanesContentProps) {
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>(
    () => Object.fromEntries(tasks.map((task) => [task.id, task.assignedTo || '']))
  );
  const [activeTask, setActiveTask] = useState<LaneTask | null>(null);
  const [isReassigning, setIsReassigning] = useState<string | null>(null);

  const { success, error } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const taskById = useMemo(() => new Map<string, LaneTask>(tasks.map((task) => [task.id, task])), [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id);
    setActiveTask(taskById.get(taskId) || null);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveTask(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const taskId = String(active.id);
    const newAssigneeId = String(over.id);
    const oldAssigneeId = taskAssignments[taskId];

    if (oldAssigneeId === newAssigneeId) return;

    setTaskAssignments((prev) => ({
      ...prev,
      [taskId]: newAssigneeId,
    }));
    setIsReassigning(taskId);

    try {
      const response = await fetch('/api/tasks/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, assignedTo: newAssigneeId }),
      });

      if (!response.ok) throw new Error('Failed to reassign task');

      success('Task reassigned successfully');
    } catch {
      setTaskAssignments((prev) => ({
        ...prev,
        [taskId]: oldAssigneeId,
      }));
      error('Failed to reassign task');
    } finally {
      setIsReassigning(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Timezone Lanes</h1>
        <p className="text-sm text-muted-foreground">
          Drag tasks between lanes to reassign work
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <TimezoneBoard users={users} tasks={tasks as LaneTask[]} taskAssignments={taskAssignments} />
          <DragOverlay>
            {activeTask && (
              <div className={cn('w-72 rotate-1 opacity-95 shadow-xl', isReassigning === activeTask.id && 'opacity-70')}>
                <UnifiedTaskCard task={activeTask} variant="compact" draggable={false} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
