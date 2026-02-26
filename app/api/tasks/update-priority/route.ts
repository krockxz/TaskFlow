/**
 * Update Task Priority API Route
 *
 * Handles task priority updates with event logging.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { apiSuccess, notFound, unauthorized, validationError, serverError, handleApiError } from '@/lib/api/errors';

const updatePrioritySchema = z.object({
  taskId: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { taskId, priority } = updatePrioritySchema.parse(body);

    // Get current task state
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFound('Task not found');
    }

    // Update task priority
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { priority },
      include: {
        createdBy: { select: { id: true, email: true } },
        assignedToUser: { select: { id: true, email: true } },
      },
    });

    // Create event log
    await prisma.taskEvent.create({
      data: {
        taskId,
        eventType: 'PRIORITY_CHANGED',
        changedById: user.id,
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/update-priority');
    if (handled) return handled;

    return serverError();
  }
}
