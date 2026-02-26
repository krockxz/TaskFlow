import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { handoffTemplateSchema } from '@/lib/validation/template';
import { notFound, unauthorized, validationError, serverError, handleApiError, apiSuccess } from '@/lib/api/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const template = await prisma.handoffTemplate.findFirst({
      where: { id, createdById: user.id },
    });

    if (!template) {
      return notFound();
    }

    return NextResponse.json(template);
  } catch (error) {
    const handled = handleApiError(error, 'GET /api/templates/[id]');
    if (handled) return handled;

    return serverError('Failed to fetch template');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const validated = handoffTemplateSchema.parse(body);

    const template = await prisma.handoffTemplate.updateMany({
      where: { id, createdById: user.id },
      data: {
        name: validated.name,
        description: validated.description,
        steps: validated.steps,
      },
    });

    if (template.count === 0) {
      return notFound();
    }

    return apiSuccess();
  } catch (error) {
    const handled = handleApiError(error, 'PUT /api/templates/[id]');
    if (handled) return handled;

    return serverError('Failed to update template');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const template = await prisma.handoffTemplate.deleteMany({
      where: { id, createdById: user.id },
    });

    if (template.count === 0) {
      return notFound();
    }

    return apiSuccess();
  } catch (error) {
    const handled = handleApiError(error, 'DELETE /api/templates/[id]');
    if (handled) return handled;

    return serverError('Failed to delete template');
  }
}
