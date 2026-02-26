import { Suspense } from 'react';
import { getAuthUser } from '@/lib/middleware/auth';
import prisma from '@/lib/prisma';
import { TemplatesList } from '@/components/templates/TemplatesList';
import { TemplatesGridSkeleton } from '@/components/skeletons/template-card-skeleton';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';

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
    <>
      <UnifiedHeader
        variant="dashboard"
        userEmail={user.email ?? 'Unknown'}
        title="Handoff Templates"
        description="Manage templates for standardized task workflows"
        backTo="/dashboard"
      />
      <div className="container py-8">
        <Suspense fallback={<TemplatesGridSkeleton count={6} />}>
          <TemplatesList templates={templates} />
        </Suspense>
      </div>
    </>
  );
}
