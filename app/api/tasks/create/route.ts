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

const createTaskSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const user = await requireAuth();

  try {
    const body = await request.json();
    const input = createTaskSchema.parse(body);

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
