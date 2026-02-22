import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { customFieldsSchema } from '@/lib/validation/template';
import { TaskStatus } from '@prisma/client';
import { z } from 'zod';

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
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
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
          return NextResponse.json({
            error: 'Missing required fields',
            missingFields,
            requiredFields: targetStep.requiredFields,
          }, { status: 400 });
        }

        // Validate custom fields against schema
        try {
          customFieldsSchema.parse(customFields);
        } catch (error) {
          return NextResponse.json({
            error: 'Invalid custom fields',
            details: error,
          }, { status: 400 });
        }
      }

      // Validate that the status transition is allowed
      const currentStep = templateSteps.find((s) => s.status === task.status);
      if (currentStep && !currentStep.allowedTransitions.includes(status)) {
        return NextResponse.json({
          error: 'Status transition not allowed',
          currentStatus: task.status,
          requestedStatus: status,
          allowedTransitions: currentStep.allowedTransitions,
        }, { status: 400 });
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('PATCH /api/tasks/set-status error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
