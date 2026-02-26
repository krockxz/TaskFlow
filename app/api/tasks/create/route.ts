/**
 * Create Task API Route
 *
 * Handles task creation with notification generation.
 * All operations wrapped in a transaction for atomicity.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { customFieldsSchema } from '@/lib/validation/template';
import { TaskStatus } from '@prisma/client';
import { apiSuccess, notFound, unauthorized, validationError, badRequest, serverError, handleApiError, apiError } from '@/lib/api/errors';

const createTaskSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  templateId: z.string().uuid().optional(),
  customFields: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE']).optional(),
  timezone: z.string().optional(),
});

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

      // Get the step for the initial status
      const templateSteps = template.steps as Array<{
        status: TaskStatus;
        requiredFields: Array<{ name: string }>;
      }>;
      const initialStep = templateSteps.find((s) => s.status === (input.status || 'OPEN'));

      if (initialStep && initialStep.requiredFields.length > 0) {
        // Validate that all required fields are present
        const requiredFieldNames = initialStep.requiredFields.map((f) => f.name);
        const providedFields = input.customFields || {};

        const missingFields = requiredFieldNames.filter(
          (name) => !(name in providedFields) || providedFields[name] === '' || providedFields[name] === null
        );

        if (missingFields.length > 0) {
          return apiError('Missing required fields for template', 400, undefined, {
            missingFields,
            requiredFields: initialStep.requiredFields,
          });
        }

        // Validate custom fields against schema
        try {
          customFieldsSchema.parse(input.customFields);
        } catch (error) {
          return badRequest('Invalid custom fields');
        }
      }
    }

    // Use transaction to ensure atomicity
    // If any operation fails, all changes are rolled back
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
        include: {
          createdBy: { select: { id: true, email: true } },
          assignedToUser: { select: { id: true, email: true } },
        },
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
