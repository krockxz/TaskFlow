/**
 * Reassign Task API Route
 *
 * Handles task reassignment with event logging and notifications.
 */

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { apiSuccess, notFound, serverError, handleApiError } from '@/lib/api/errors';
import { reassignRequestSchema } from '@/lib/api/schemas';
import { fetchTask, verifyUserExists, TASK_INCLUDES } from '@/lib/api/handlers/task';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { taskId, assignedTo } = reassignRequestSchema.parse(body);

    // If assigning to a user, verify they exist first
    if (assignedTo !== null) {
      const assigneeExists = await verifyUserExists(assignedTo);
      if (!assigneeExists) {
        return notFound('Assignee not found');
      }
    }

    // Get current task state
    const task = await fetchTask(taskId);

    if (!task) {
      return notFound('Task not found');
    }

    // Update task assignment, create event, and send notification in transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
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
      await tx.taskEvent.create({
        data: {
          taskId,
          eventType: 'ASSIGNED',
          changedById: user.id,
        },
      });

      // Create notification for new assignee
      if (assignedTo && assignedTo !== user.id) {
        await tx.notification.create({
          data: {
            userId: assignedTo,
            taskId,
            message: `You were assigned a task: ${task.title}`,
          },
        });
      }

      return updatedTask;
    });

    return apiSuccess(updated);
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/reassign');
    if (handled) return handled;

    return serverError();
  }
}
