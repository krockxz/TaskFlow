'use client';

import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragStartEvent, DragCancelEvent, DragOverlay } from '@dnd-kit/core';
import { Task, User } from '@prisma/client';
import { Lane } from './Lane';
import { TaskCard } from './TaskCard';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TimezoneBoardProps {
  users: User[];
  tasks: Task[];
}

export function TimezoneBoard({ users, tasks }: TimezoneBoardProps) {
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>(
    Object.fromEntries(tasks.map(t => [t.id, t.assignedTo || '']))
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isReassigning, setIsReassigning] = useState<string | null>(null);

  const { success, error } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveTask(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

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
    setIsReassigning(taskId);

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
    } finally {
      setIsReassigning(null);
    }
  };

  // Group tasks by assigned user and unassigned - O(T) single pass using Map
  // Combines both computations to avoid iterating tasks twice
  const { tasksByUser, unassignedTasks } = useMemo(() => {
    const userTasksMap = new Map<string, Task[]>();
    const unassigned: Task[] = [];

    // Initialize empty arrays for all users to ensure consistent ordering
    for (const user of users) {
      userTasksMap.set(user.id, []);
    }

    // Distribute tasks to their assigned users in a single pass
    for (const task of tasks) {
      const assigneeId = taskAssignments[task.id];
      if (!assigneeId || assigneeId === '') {
        unassigned.push(task);
      } else if (userTasksMap.has(assigneeId)) {
        userTasksMap.get(assigneeId)!.push(task);
      }
    }

    // Convert Map to Record for consistent access pattern
    return {
      tasksByUser: Object.fromEntries(userTasksMap) as Record<string, Task[]>,
      unassignedTasks,
    };
  }, [users, tasks, taskAssignments]);

  // Unassigned lane user object (virtual)
  const unassignedUser = useMemo(() => ({
    id: 'unassigned',
    email: 'Unassigned',
    timezone: null,
  }), []);

  return (
    <div className="flex gap-4 overflow-x-auto px-4 h-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <Lane
          key="unassigned"
          user={unassignedUser}
          tasks={unassignedTasks}
        />
        {users.map((user) => (
          <Lane
            key={user.id}
            user={user}
            tasks={tasksByUser[user.id] || []}
          />
        ))}
        <DragOverlay>
          {activeTask && (
            <div className={cn(
              "opacity-80 rotate-3 transition-opacity",
              isReassigning === activeTask.id && "opacity-50"
            )}>
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
