/**
 * Create Task API Route
 *
 * Handles task creation with notification generation.
 */

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  assignedTo: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = createTaskSchema.parse(body);

    // Create task
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        assignedTo: input.assignedTo,
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, email: true } },
        assignedToUser: { select: { id: true, email: true } },
      },
    });

    // Create event log
    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        eventType: 'CREATED',
        newStatus: task.status,
        changedById: user.id,
      },
    });

    // Create notification for assignee
    if (input.assignedTo && input.assignedTo !== user.id) {
      await prisma.notification.create({
        data: {
          userId: input.assignedTo,
          taskId: task.id,
          message: `You have been assigned a new task: ${task.title}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
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
