import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { customFieldsSchema } from '@/lib/validation/template';
import { TaskStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await requireAuth();
  const { taskId } = await params;

  const body = await request.json();
  const { status, customFields } = body;

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
    const templateSteps = task.template.steps as any[];
    const targetStep = templateSteps.find((s: any) => s.status === status);

    if (targetStep && targetStep.requiredFields.length > 0) {
      // Validate that all required fields are present
      const requiredFieldNames = targetStep.requiredFields.map((f: any) => f.name);
      const providedFields = customFields || {};

      const missingFields = requiredFieldNames.filter(
        (name: string) => !(name in providedFields) || providedFields[name] === '' || providedFields[name] === null
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
    const currentStep = templateSteps.find((s: any) => s.status === task.status);
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
      customFields: customFields || task.customFields,
    },
  });

  return NextResponse.json(updatedTask);
}
