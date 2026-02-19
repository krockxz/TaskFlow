/**
 * Users API Route
 *
 * GET - Returns all users for the assignment dropdown.
 * Only accessible by authenticated users.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET() {
  await requireAuth();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
      orderBy: { email: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
