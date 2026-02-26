import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { handoffTemplateSchema } from '@/lib/validation/template';
import { unauthorized, validationError, badRequest, serverError, handleApiError, created } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const templates = await prisma.handoffTemplate.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    const handled = handleApiError(error, 'GET /api/templates');
    if (handled) return handled;

    return serverError('Failed to fetch templates');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validated = handoffTemplateSchema.parse(body);

    const template = await prisma.handoffTemplate.create({
      data: {
        name: validated.name,
        description: validated.description,
        steps: validated.steps,
        createdById: user.id,
      },
    });

    return created(template);
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/templates');
    if (handled) return handled;

    return serverError('Failed to create template');
  }
}
