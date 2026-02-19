import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { TaskStatus, TaskPriority } from '@/lib/types';
import { requireAuth } from '@/lib/middleware/auth';

export async function POST(req: Request) {
  const user = await requireAuth();

  const { taskIds, action, payload } = await req.json();

  // Validate input
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return NextResponse.json({ error: 'Invalid task IDs' }, { status: 400 });
  }

  if (!action || typeof action !== 'string') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

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
  try {
    switch (action) {
      case 'delete': {
        await prisma.task.deleteMany({
          where: { id: { in: taskIds } },
        });
        break;
      }

      case 'changeStatus': {
        const { status } = payload as { status: TaskStatus };
        if (!status || !['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE'].includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
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
        const { priority } = payload as { priority: TaskPriority };
        if (!priority || !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
          return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
        }
        await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { priority },
        });
        break;
      }

      case 'reassign': {
        const { assignedTo } = payload as { assignedTo: string };
        if (!assignedTo || typeof assignedTo !== 'string') {
          return NextResponse.json({ error: 'Invalid assignee' }, { status: 400 });
        }
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
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
