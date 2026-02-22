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
      include: {
        createdBy: { select: { id: true, email: true } },
        assignedToUser: { select: { id: true, email: true } },
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
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          taskId,
          message: `${user.email} assigned you a task: ${task.title}`,
        },
      });
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
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
