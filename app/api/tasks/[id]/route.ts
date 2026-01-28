/**
 * Task Detail API Route
 *
 * GET - Returns a single task with full details and event history.
 */

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/tasks/[id]
 * Returns a task with full details including:
 * - Created by user
 * - Assigned user
 * - Full event history with changed by user
 */
export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, email: true },
        },
        assignedToUser: {
          select: { id: true, email: true },
        },
        events: {
          include: {
            changedBy: {
              select: { email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this task
    const hasAccess =
      task.createdById === user.id ||
      task.assignedTo === user.id;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a task (soft delete by updating status or hard delete).
 * For MVP, we'll do a hard delete.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    // First verify ownership
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (task.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only creator can delete' },
        { status: 403 }
      );
    }

    // Delete the task (cascade will delete events and notifications)
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
