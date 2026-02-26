/**
 * Update Task Status API Route
 *
 * Simple status update endpoint (without template support).
 * For template-aware status updates with custom fields, use PATCH /api/tasks/set-status.
 *
 * @deprecated Use PATCH /api/tasks/set-status for template-aware updates
 */

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { apiSuccess, notFound, serverError, handleApiError } from '@/lib/api/errors';
import { updateStatusRequestSchema } from '@/lib/api/schemas';
import { fetchTask, TASK_INCLUDES } from '@/lib/api/handlers/task';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { taskId, status } = updateStatusRequestSchema.parse(body);

    // Get current task state
    const task = await fetchTask(taskId);

    if (!task) {
      return notFound('Task not found');
    }

    // Update task status and create event in transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: { status },
        include: TASK_INCLUDES,
      });

      // Create event log
      await tx.taskEvent.create({
        data: {
          taskId,
          eventType: 'STATUS_CHANGED',
          oldStatus: task.status,
          newStatus: status,
          changedById: user.id,
        },
      });

      return updatedTask;
    });

    return apiSuccess(updated);
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/update-status');
    if (handled) return handled;

    return serverError();
  }
}
