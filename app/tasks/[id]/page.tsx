import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { TASK_WITH_EVENTS_INCLUDES } from '@/lib/api/handlers/task';
import type { EventType, TaskStatus, TaskPriority } from '@prisma/client';
import type { Task, TaskEvent } from '@/lib/types';
import { taskIdSchema } from '@/lib/api/schemas';
import { TaskDetailClient } from './TaskDetailClient';

type RouteProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Task Details',
};

function serializeCustomFields(value: unknown): Record<string, string | number | boolean | null> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const result: Record<string, string | number | boolean | null> = {};
  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (
      entryValue === null ||
      typeof entryValue === 'string' ||
      typeof entryValue === 'number' ||
      typeof entryValue === 'boolean'
    ) {
      result[key] = entryValue;
    }
  }

  return result;
}

export default async function TaskPage({ params }: RouteProps) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  taskIdSchema.parse(id);

  const [taskRecord, users] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
      include: TASK_WITH_EVENTS_INCLUDES,
    }),
    prisma.user.findMany({
      select: { id: true, email: true },
      orderBy: { email: 'asc' },
    }),
  ]);

  if (
    !taskRecord ||
    (taskRecord.createdById !== user.id && taskRecord.assignedTo !== user.id)
  ) {
    notFound();
  }

  const task: Task = {
    id: taskRecord.id,
    title: taskRecord.title,
    description: taskRecord.description,
    status: taskRecord.status as TaskStatus,
    priority: taskRecord.priority as TaskPriority,
    dueDate: taskRecord.dueDate ? taskRecord.dueDate.toISOString() : null,
    createdById: taskRecord.createdById,
    assignedTo: taskRecord.assignedTo,
    createdAt: taskRecord.createdAt.toISOString(),
    updatedAt: taskRecord.updatedAt.toISOString(),
    githubIssueUrl: taskRecord.githubIssueUrl,
    githubIssueNumber: taskRecord.githubIssueNumber,
    githubPrUrl: taskRecord.githubPrUrl,
    githubRepo: taskRecord.githubRepo,
    templateId: taskRecord.templateId,
    customFields: serializeCustomFields(taskRecord.customFields),
    createdBy: taskRecord.createdBy,
    assignedToUser: taskRecord.assignedToUser,
    template: taskRecord.template,
    events: taskRecord.events.map((event): TaskEvent => ({
      id: event.id,
      taskId: event.taskId,
      eventType: event.eventType as EventType,
      oldStatus: event.oldStatus,
      newStatus: event.newStatus,
      changedById: event.changedById,
      createdAt: event.createdAt.toISOString(),
      changedBy: event.changedBy,
    })),
  };

  return <TaskDetailClient initialTask={task} users={users} />;
}
