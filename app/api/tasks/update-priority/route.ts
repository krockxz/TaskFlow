/**
 * Update Task Priority API Route
 *
 * Handles task priority updates with event logging.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';

const updatePrioritySchema = z.object({
  taskId: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export async function POST(request: Request) {
  const user = await requireAuth();

  try {
    const body = await request.json();
    const { taskId, priority } = updatePrioritySchema.parse(body);

    // Get current task state
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task priority
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { priority },
      include: {
        createdBy: { select: { id: true, email: true } },
        assignedToUser: { select: { id: true, email: true } },
      },
    });

    // Create event log
    await prisma.taskEvent.create({
      data: {
        taskId,
        eventType: 'PRIORITY_CHANGED',
        changedById: user.id,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('POST /api/tasks/update-priority error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
