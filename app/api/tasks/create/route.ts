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
  const user = await requireAuth();

  try {
    const body = await request.json();
    const input = createTaskSchema.parse(body);

    // If a template is provided, validate custom fields
    if (input.templateId) {
      const template = await prisma.handoffTemplate.findUnique({
        where: { id: input.templateId },
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      // Get the step for the initial status
      const templateSteps = template.steps as any[];
      const initialStep = templateSteps.find((s: any) => s.status === (input.status || 'OPEN'));

      if (initialStep && initialStep.requiredFields.length > 0) {
        // Validate that all required fields are present
        const requiredFieldNames = initialStep.requiredFields.map((f: any) => f.name);
        const providedFields = input.customFields || {};

        const missingFields = requiredFieldNames.filter(
          (name: string) => !(name in providedFields) || providedFields[name] === '' || providedFields[name] === null
        );

        if (missingFields.length > 0) {
          return NextResponse.json({
            error: 'Missing required fields for template',
            missingFields,
            requiredFields: initialStep.requiredFields,
          }, { status: 400 });
        }

        // Validate custom fields against schema
        try {
          customFieldsSchema.parse(input.customFields);
        } catch (error) {
          return NextResponse.json({
            error: 'Invalid custom fields',
            details: error,
          }, { status: 400 });
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

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the task' },
      { status: 500 }
    );
  }
}
