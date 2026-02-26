import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { TaskStatus, TaskPriority } from '@prisma/client';
import { requireAuth } from '@/lib/middleware/auth';
import { z } from 'zod';
import { apiSuccess, notFound, forbidden, unauthorized, validationError, badRequest, serverError, handleApiError } from '@/lib/api/errors';

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
      return forbidden('Some tasks not found or access denied');
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
          return notFound('Assignee not found');
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
        return badRequest('Unknown action');
    }

    return apiSuccess({ affected: taskIds.length });
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/bulk');
    if (handled) return handled;

    return serverError('Failed to perform bulk action');
  }
}
