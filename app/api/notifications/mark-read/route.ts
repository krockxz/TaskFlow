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
import { apiSuccess, notFound, forbidden, unauthorized, validationError, badRequest, serverError, handleApiError } from '@/lib/api/errors';

const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
});

/**
 * POST /api/notifications/mark-read
 * Marks all notifications as read for the current user.
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return apiSuccess();
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/notifications/mark-read');
    if (handled) return handled;

    return serverError('Failed to mark notifications as read');
  }
}

/**
 * PATCH /api/notifications/mark-read
 * Marks a specific notification as read.
 * Body: { notificationId: string }
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { notificationId } = markReadSchema.parse(body);

    if (!notificationId) {
      return badRequest('notificationId is required');
    }

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return notFound('Notification not found');
    }

    if (notification.userId !== user.id) {
      return forbidden();
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return apiSuccess();
  } catch (error) {
    const handled = handleApiError(error, 'PATCH /api/notifications/mark-read');
    if (handled) return handled;

    return serverError('Failed to mark notification as read');
  }
}
