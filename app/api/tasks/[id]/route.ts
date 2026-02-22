/**
 * Task Detail API Route
 *
 * GET - Returns a single task with full details and event history.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import type { Task, TaskEvent } from '@/lib/types';

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
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this task
    const hasAccess =
      task.createdById === user.id ||
      task.assignedTo === user.id;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Convert Date objects to strings for type compatibility
    const serializedTask: Task = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as any,
      priority: task.priority as any,
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
        eventType: event.eventType as any,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
        changedById: event.changedById,
        createdAt: event.createdAt.toISOString(),
        changedBy: event.changedBy,
      })),
    };

    return NextResponse.json(serializedTask);
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('GET /api/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (task.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only creator can delete' },
        { status: 403 }
      );
    }

    // Delete the task (cascade will delete events and notifications)
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
