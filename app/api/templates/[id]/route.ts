import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { handoffTemplateSchema } from '@/lib/validation/template';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id } = await params;

  const template = await prisma.handoffTemplate.findFirst({
    where: { id, createdById: user.id },
  });

  if (!template) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  const { id } = await params;

  const template = await prisma.handoffTemplate.deleteMany({
    where: { id, createdById: user.id },
  });

  if (template.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
