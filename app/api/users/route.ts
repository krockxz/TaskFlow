/**
 * Users API Route
 *
 * GET - Returns paginated users for the assignment dropdown.
 * Only accessible by authenticated users.
 */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { unauthorized, serverError, handleApiError } from '@/lib/api/errors';

interface UsersResponse {
  users: Array<{ id: string; email: string }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const search = searchParams.get('search') || undefined;

    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeParam || '50', 10)));
    const skip = (page - 1) * pageSize;

    // Build where clause for search
    const where = search
      ? { email: { contains: search, mode: 'insensitive' as const } }
      : {};

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
        },
        orderBy: { email: 'asc' },
        take: pageSize,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    const response: UsersResponse = {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(response);
  } catch (error) {
    const handled = handleApiError(error, 'GET /api/users');
    if (handled) return handled;

    return serverError('Failed to fetch users');
  }
}
