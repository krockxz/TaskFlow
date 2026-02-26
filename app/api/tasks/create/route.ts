/**
 * Create Task API Route
 *
 * Handles task creation with notification generation.
 * All operations wrapped in a transaction for atomicity.
 */

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { apiSuccess, notFound, serverError, handleApiError, apiError, badRequest } from '@/lib/api/errors';
import { createTaskSchema } from '@/lib/api/schemas';
import { validateTemplateFields, TASK_INCLUDES } from '@/lib/api/handlers/task';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const input = createTaskSchema.parse(body);

    // If an assignee is provided, verify they exist in the database
    if (input.assignedTo) {
      const assigneeExists = await prisma.user.findUnique({
        where: { id: input.assignedTo },
        select: { id: true },
      });

      if (!assigneeExists) {
        return notFound('Assignee not found');
      }
    }

    // If a template is provided, validate custom fields
    if (input.templateId) {
      const template = await prisma.handoffTemplate.findUnique({
        where: { id: input.templateId },
      });

      if (!template) {
        return notFound('Template not found');
      }

      const validation = await validateTemplateFields(
        template,
        input.status || 'OPEN',
        input.customFields
      );

      if (!validation.isValid && validation.errorResponse) {
        return validation.errorResponse;
      }
    }

    // Use transaction to ensure atomicity
    const task = await prisma.$transaction(async (tx) => {
      // Create task
      const newTask = await tx.task.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority,
          assignedTo: input.assignedTo,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          createdById: user.id,
          templateId: input.templateId,
          customFields: input.customFields || {},
          status: input.status,
          timezone: input.timezone,
        },
        include: TASK_INCLUDES,
      });

      // Create event log
      await tx.taskEvent.create({
        data: {
          taskId: newTask.id,
          eventType: 'CREATED',
          newStatus: newTask.status,
          changedById: user.id,
        },
      });

      // Create notification for assignee (if assigned to someone else)
      if (input.assignedTo && input.assignedTo !== user.id) {
        await tx.notification.create({
          data: {
            userId: input.assignedTo,
            taskId: newTask.id,
            message: `You have been assigned a new task: ${newTask.title}`,
          },
        });
      }

      return newTask;
    });

    return apiSuccess(task);
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/create');
    if (handled) return handled;

    return serverError('An error occurred while creating the task');
  }
}
