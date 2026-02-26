/**
 * Notifications API Route
 *
 * GET - Returns notifications for the current authenticated user.
 * Query params:
 *   - unread_only=true: Only return unread notifications
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { unauthorized, serverError, handleApiError } from '@/lib/api/errors';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    const handled = handleApiError(error, 'GET /api/notifications');
    if (handled) return handled;

    return serverError('Failed to fetch notifications');
  }
}
