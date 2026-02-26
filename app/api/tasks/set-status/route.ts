/**
 * Set Task Status API Route
 *
 * Handles task status updates with template support and custom fields validation.
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { setStatusWithCustomFieldsSchema } from '@/lib/api/schemas';
import { fetchTaskWithTemplate, validateTemplateFields, validateTemplateTransition } from '@/lib/api/handlers/task';
import { apiSuccess, notFound, serverError, handleApiError } from '@/lib/api/errors';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { id: taskId, status, customFields } = setStatusWithCustomFieldsSchema.parse(body);

    // Fetch the task with its template
    const task = await fetchTaskWithTemplate(taskId);

    if (!task) {
      return notFound('Task not found');
    }

    // If task has a template, validate required fields for the new status
    if (task.template) {
      const fieldValidation = await validateTemplateFields(task.template, status, customFields);
      if (!fieldValidation.isValid && fieldValidation.errorResponse) {
        return fieldValidation.errorResponse;
      }

      // Validate that the status transition is allowed
      const transitionValidation = validateTemplateTransition(task.template, task.status, status);
      if (!transitionValidation.isValid && transitionValidation.errorResponse) {
        return transitionValidation.errorResponse;
      }
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        customFields: (customFields ?? task.customFields) as Record<string, string | number | boolean | null>,
      },
    });

    return apiSuccess(updatedTask);
  } catch (error) {
    const handled = handleApiError(error, 'PATCH /api/tasks/set-status');
    if (handled) return handled;

    return serverError();
  }
}
