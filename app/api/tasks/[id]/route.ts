/**
 * Task Detail API Route
 *
 * GET - Returns a single task with full details and event history.
 * DELETE - Deletes a task (only by creator).
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import type { Task, TaskEvent } from '@/lib/types';
import type { TaskStatus, TaskPriority, EventType } from '@prisma/client';
import { notFound, forbidden, serverError, handleApiError, apiSuccess } from '@/lib/api/errors';
import { taskIdSchema } from '@/lib/api/schemas';
import { TASK_WITH_EVENTS_INCLUDES } from '@/lib/api/handlers/task';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/tasks/[id]
 * Returns a task with full details including:
 * - Created by user
 * - Assigned user
 * - Full event history with changed by user
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    // Validate task ID format
    taskIdSchema.parse(id);

    const task = await prisma.task.findUnique({
      where: { id },
      include: TASK_WITH_EVENTS_INCLUDES,
    });

    if (!task) {
      return notFound('Task not found');
    }

    // Verify user has access to this task
    const hasAccess =
      task.createdById === user.id ||
      task.assignedTo === user.id;

    if (!hasAccess) {
      return forbidden();
    }

    // Convert Date objects to strings for type compatibility
    const serializedTask: Task = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdById: task.createdById,
      assignedTo: task.assignedTo,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      createdBy: task.createdBy,
      assignedToUser: task.assignedToUser,
      events: task.events.map((event): TaskEvent => ({
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

    return Response.json(serializedTask);
  } catch (error) {
    const handled = handleApiError(error, 'GET /api/tasks/[id]');
    if (handled) return handled;

    return serverError('Failed to fetch task');
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a task (only creator can delete).
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    // Validate task ID format
    taskIdSchema.parse(id);

    // First verify ownership
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return notFound('Task not found');
    }

    if (task.createdById !== user.id) {
      return forbidden('Only creator can delete');
    }

    // Delete the task (cascade will delete events and notifications)
    await prisma.task.delete({
      where: { id },
    });

    return apiSuccess();
  } catch (error) {
    const handled = handleApiError(error, 'DELETE /api/tasks/[id]');
    if (handled) return handled;

    return serverError('Failed to delete task');
  }
}
