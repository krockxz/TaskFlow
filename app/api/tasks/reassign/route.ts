/**
 * Reassign Task API Route
 *
 * Handles task reassignment with event logging and notifications.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';

const reassignSchema = z.object({
  taskId: z.string().uuid(),
  assignedTo: z.string().uuid().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { taskId, assignedTo } = reassignSchema.parse(body);

    // Get current task state
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task assignment
    const updated = await prisma.task.update({
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
    await prisma.taskEvent.create({
      data: {
        taskId,
        eventType: 'ASSIGNED',
        changedById: user.id,
      },
    });

    // Create notification for new assignee
    if (assignedTo && assignedTo !== user.id) {
      // Verify the assignee exists in the database before creating notification
      const assigneeExists = await prisma.user.findUnique({
        where: { id: assignedTo },
        select: { id: true },
      });

      if (assigneeExists) {
        await prisma.notification.create({
          data: {
            userId: assignedTo,
            taskId,
            message: `You were assigned a task: ${task.title}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
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

    console.error('POST /api/tasks/reassign error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An error occurred', details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined },
      { status: 500 }
    );
  }
}
