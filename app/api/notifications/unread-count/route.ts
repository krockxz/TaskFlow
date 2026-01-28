/**
 * Unread Notification Count API Route
 *
 * GET - Returns the count of unread notifications for the current user.
 */

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('GET /api/notifications/unread-count error:', error);
    return NextResponse.json({ count: 0 });
  }
}
