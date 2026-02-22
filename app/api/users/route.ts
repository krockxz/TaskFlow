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
  try {
    const user = await requireAuth();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
      orderBy: { email: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
