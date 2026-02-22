import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { TaskStatus, TaskPriority } from '@/lib/types';
import { requireAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

const bulkActionSchema = z.enum(['delete', 'changeStatus', 'changePriority', 'reassign']);

const bulkRequestSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
  action: bulkActionSchema,
  payload: z
    .discriminatedUnion('action', [
      z.object({
        action: z.literal('changeStatus'),
        status: z.enum(['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE']),
      }),
      z.object({
        action: z.literal('changePriority'),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      }),
      z.object({
        action: z.literal('reassign'),
        assignedTo: z.string().min(1),
      }),
    ])
    .optional()
    .transform((val) => {
      // Extract just the action-specific payload
      if (!val) return undefined;
      const { action, ...rest } = val;
      return rest as { status?: TaskStatus; priority?: TaskPriority; assignedTo?: string };
    }),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const validated = bulkRequestSchema.parse(body);

    const { taskIds, action, payload } = validated;

    // Verify user has access to all tasks
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        OR: [
          { assignedTo: user.id },
          { createdById: user.id },
        ],
      },
      select: { id: true },
    });

    if (tasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: 'Some tasks not found or access denied' },
        { status: 403 }
      );
    }

    // Execute bulk action
    switch (action) {
      case 'delete': {
        // Intentionally no task event creation for delete:
        // Events are foreign-keyed to tasks and would be cascaded away.
        // The tasks themselves are permanently removed, so an audit trail
        // within the task_events table would serve no purpose.
        await prisma.task.deleteMany({
          where: { id: { in: taskIds } },
        });
        break;
      }

      case 'changeStatus': {
        const status = payload?.status as TaskStatus;
        await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { status },
        });
        // Create task events for audit trail
        await prisma.taskEvent.createMany({
          data: taskIds.map((taskId) => ({
            taskId,
            eventType: 'STATUS_CHANGED',
            newStatus: status,
            changedById: user.id,
          })),
        });
        break;
      }

      case 'changePriority': {
        const priority = payload?.priority as TaskPriority;
        await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { priority },
        });
        // Create task events for audit trail
        await prisma.taskEvent.createMany({
          data: taskIds.map((taskId) => ({
            taskId,
            eventType: 'PRIORITY_CHANGED',
            newPriority: priority,
            changedById: user.id,
          })),
        });
        break;
      }

      case 'reassign': {
        const assignedTo = payload?.assignedTo as string;
        // Verify assignee exists
        const assignee = await prisma.user.findUnique({
          where: { id: assignedTo },
          select: { id: true },
        });
        if (!assignee) {
          return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
        }
        await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { assignedTo },
        });
        // Create task events for audit trail
        await prisma.taskEvent.createMany({
          data: taskIds.map((taskId) => ({
            taskId,
            eventType: 'ASSIGNED',
            changedById: user.id,
          })),
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      affected: taskIds.length,
    });
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
        {
          error: 'Invalid request body',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
