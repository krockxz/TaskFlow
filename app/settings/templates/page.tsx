import { Suspense } from 'react';
import { getAuthUser } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { TemplatesList } from '@/components/templates/TemplatesList';

async function getTemplates(userId: string) {
  return prisma.handoffTemplate.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function TemplatesPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const templates = await getTemplates(user.id);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Handoff Templates</h1>
        <p className="text-muted-foreground">
          Manage templates for standardized task workflows
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <TemplatesList templates={templates} />
      </Suspense>
    </div>
  );
}
