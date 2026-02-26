/**
 * Update Task Status API Route
 *
 * Handles task status updates with event logging.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { apiSuccess, notFound, unauthorized, validationError, serverError, handleApiError } from '@/lib/api/errors';

const updateStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE']),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { taskId, status } = updateStatusSchema.parse(body);

    // Get current task state
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFound('Task not found');
    }

    // Update task status
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        createdBy: { select: { id: true, email: true } },
        assignedToUser: { select: { id: true, email: true } },
      },
    });

    // Create event log
    await prisma.taskEvent.create({
      data: {
        taskId,
        eventType: 'STATUS_CHANGED',
        oldStatus: task.status,
        newStatus: status,
        changedById: user.id,
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/update-status');
    if (handled) return handled;

    return serverError();
  }
}
