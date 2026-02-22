/**
 * Update Task Status API Route
 *
 * Handles task status updates with event logging.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';

const updateStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE']),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { taskId, status } = updateStatusSchema.parse(body);

    // Get current task state
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task status
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        createdBy: { select: { id: true, email: true } },
        assignedToUser: { select: { id: true, email: true } },
      },
    });

    // Create event log
    await prisma.taskEvent.create({
      data: {
        taskId,
        eventType: 'STATUS_CHANGED',
        oldStatus: task.status,
        newStatus: status,
        changedById: user.id,
      },
    });

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

    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
