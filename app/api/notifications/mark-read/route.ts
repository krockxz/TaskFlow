/**
 * Mark Notifications Read API Route
 *
 * POST - Marks all notifications as read for the current user.
 * PATCH - Marks a specific notification as read.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';

const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
});

/**
 * POST /api/notifications/mark-read
 * Marks all notifications as read for the current user.
 */
export async function POST(request: Request) {
  const user = await requireAuth();

  try {
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/notifications/mark-read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/mark-read
 * Marks a specific notification as read.
 * Body: { notificationId: string }
 */
export async function PATCH(request: Request) {
  const user = await requireAuth();

  try {
    const body = await request.json();
    const { notificationId } = markReadSchema.parse(body);

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'notificationId is required' },
        { status: 400 }
      );
    }

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('PATCH /api/notifications/mark-read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
