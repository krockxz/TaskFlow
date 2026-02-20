import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { handoffTemplateSchema } from '@/lib/validation/template';

export async function GET(request: NextRequest) {
  const user = await requireAuth();

  const templates = await prisma.handoffTemplate.findMany({
    where: { createdById: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
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

  return NextResponse.json(template, { status: 201 });
}
