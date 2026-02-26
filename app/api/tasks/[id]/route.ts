/**
 * Task Detail API Route
 *
 * GET - Returns a single task with full details and event history.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import type { Task, TaskEvent } from '@/lib/types';
import type { TaskStatus, TaskPriority, EventType } from '@prisma/client';
import { notFound, forbidden, unauthorized, serverError, handleApiError, apiSuccess } from '@/lib/api/errors';

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

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, email: true },
        },
        assignedToUser: {
          select: { id: true, email: true },
        },
        events: {
          include: {
            changedBy: {
              select: { id: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit to most recent 50 events for performance
        },
      },
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

    return NextResponse.json(serializedTask);
  } catch (error) {
    const handled = handleApiError(error, 'GET /api/tasks/[id]');
    if (handled) return handled;

    return serverError('Failed to fetch task');
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a task (soft delete by updating status or hard delete).
 * For MVP, we'll do a hard delete.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

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
