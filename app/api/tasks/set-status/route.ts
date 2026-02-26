import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { customFieldsSchema } from '@/lib/validation/template';
import { TaskStatus } from '@prisma/client';
import { z } from 'zod';
import { apiSuccess, notFound, unauthorized, validationError, badRequest, serverError, handleApiError, apiError } from '@/lib/api/errors';

const setStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE']),
  customFields: customFieldsSchema.optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { id: taskId, status, customFields } = setStatusSchema.parse(body);

    // Fetch the task with its template
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { template: true },
    });

    if (!task) {
      return notFound('Task not found');
    }

    // If task has a template, validate required fields for the new status
    if (task.template) {
      const templateSteps = task.template.steps as Array<{
        status: TaskStatus;
        requiredFields: Array<{ name: string }>;
        allowedTransitions: TaskStatus[];
      }>;
      const targetStep = templateSteps.find((s) => s.status === status);

      if (targetStep && targetStep.requiredFields.length > 0) {
        // Validate that all required fields are present
        const requiredFieldNames = targetStep.requiredFields.map((f) => f.name);
        const providedFields = customFields || {};

        const missingFields = requiredFieldNames.filter(
          (name) => !(name in providedFields) || providedFields[name] === '' || providedFields[name] === null
        );

        if (missingFields.length > 0) {
          return apiError('Missing required fields', 400, undefined, {
            missingFields,
            requiredFields: targetStep.requiredFields,
          });
        }

        // Validate custom fields against schema
        try {
          customFieldsSchema.parse(customFields);
        } catch (error) {
          return badRequest('Invalid custom fields');
        }
      }

      // Validate that the status transition is allowed
      const currentStep = templateSteps.find((s) => s.status === task.status);
      if (currentStep && !currentStep.allowedTransitions.includes(status)) {
        return apiError('Status transition not allowed', 400, undefined, {
          currentStatus: task.status,
          requestedStatus: status,
          allowedTransitions: currentStep.allowedTransitions,
        });
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
