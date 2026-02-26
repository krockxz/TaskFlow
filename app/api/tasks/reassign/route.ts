/**
 * Reassign Task API Route
 *
 * Handles task reassignment with event logging and notifications.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { apiSuccess, notFound, unauthorized, validationError, serverError, handleApiError } from '@/lib/api/errors';

const reassignSchema = z.object({
  taskId: z.string().uuid(),
  assignedTo: z.string().uuid().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { taskId, assignedTo } = reassignSchema.parse(body);

    // If assigning to a user, verify they exist first
    if (assignedTo !== null) {
      const assigneeExists = await prisma.user.findUnique({
        where: { id: assignedTo },
        select: { id: true },
      });

      if (!assigneeExists) {
        return notFound('Assignee not found');
      }
    }

    // Get current task state
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFound('Task not found');
    }

    // Update task assignment
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { assignedTo },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        assignedTo: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create event log
    await prisma.taskEvent.create({
      data: {
        taskId,
        eventType: 'ASSIGNED',
        changedById: user.id,
      },
    });

    // Create notification for new assignee
    if (assignedTo && assignedTo !== user.id) {
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          taskId,
          message: `You were assigned a task: ${task.title}`,
        },
      });
    }

    return apiSuccess(updated);
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/reassign');
    if (handled) return handled;

    return serverError();
  }
}
