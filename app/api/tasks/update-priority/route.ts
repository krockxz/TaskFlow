/**
 * Update Task Priority API Route
 *
 * Handles task priority updates with event logging.
 */

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { apiSuccess, notFound, serverError, handleApiError } from '@/lib/api/errors';
import { updatePriorityRequestSchema } from '@/lib/api/schemas';
import { fetchTask, TASK_INCLUDES } from '@/lib/api/handlers/task';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { taskId, priority } = updatePriorityRequestSchema.parse(body);

    // Get current task state
    const task = await fetchTask(taskId);

    if (!task) {
      return notFound('Task not found');
    }

    // Update task priority and create event in transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: { priority },
        include: TASK_INCLUDES,
      });

      // Create event log
      await tx.taskEvent.create({
        data: {
          taskId,
          eventType: 'PRIORITY_CHANGED',
          newPriority: priority,
          changedById: user.id,
        },
      });

      return updatedTask;
    });

    return apiSuccess(updated);
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/update-priority');
    if (handled) return handled;

    return serverError();
  }
}
