import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to create valid UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  console.log('Seeding database...');

  // Create demo users with fixed IDs for consistency
  const aliceId = '00000000-0000-4000-8000-000000000001';
  const bobId = '00000000-0000-4000-8000-000000000002';
  const carolId = '00000000-0000-4000-8000-000000000003';

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        id: aliceId,
        email: 'alice@example.com',
        timezone: 'America/Los_Angeles',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        id: bobId,
        email: 'bob@example.com',
        timezone: 'Europe/London',
      },
    }),
    prisma.user.upsert({
      where: { email: 'carol@example.com' },
      update: {},
      create: {
        id: carolId,
        email: 'carol@example.com',
        timezone: 'Asia/Tokyo',
      },
    }),
  ]);

  // Create handoff template
  const template = await prisma.handoffTemplate.upsert({
    where: { id: 'template-1' },
    update: {},
    create: {
      id: 'template-1',
      name: 'Feature Development',
      description: 'Standard workflow for feature development',
      createdById: users[0].id,
      steps: [
        {
          status: 'OPEN',
          requiredFields: [
            { name: 'requirements', type: 'textarea', label: 'Requirements', required: true },
            { name: 'acceptanceCriteria', type: 'textarea', label: 'Acceptance Criteria', required: true },
          ],
          allowedTransitions: ['IN_PROGRESS'],
        },
        {
          status: 'IN_PROGRESS',
          requiredFields: [
            { name: 'branch', type: 'text', label: 'Git Branch', required: true },
            { name: 'estimatedHours', type: 'number', label: 'Estimate (hours)', required: true },
          ],
          allowedTransitions: ['READY_FOR_REVIEW'],
        },
        {
          status: 'READY_FOR_REVIEW',
          requiredFields: [
            { name: 'prLink', type: 'text', label: 'PR Link', required: true },
          ],
          allowedTransitions: ['DONE'],
        },
      ],
    },
  });

  // Create demo tasks
  await prisma.task.upsert({
    where: { id: 'task-1' },
    update: {},
    create: {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Add OAuth login with Google and GitHub',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assignedTo: users[1].id,
      createdById: users[0].id,
      templateId: template.id,
      customFields: {
        requirements: 'Users should be able to login with OAuth',
        acceptanceCriteria: 'Login button works, redirects correctly',
        branch: 'feature/auth',
        estimatedHours: 8,
      },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-2' },
    update: {},
    create: {
      id: 'task-2',
      title: 'Design database schema',
      description: 'Create Prisma schema for new features',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      assignedTo: users[2].id,
      createdById: users[0].id,
      templateId: template.id,
      customFields: {
        prLink: 'https://github.com/org/repo/pull/123',
      },
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-3' },
    update: {},
    create: {
      id: 'task-3',
      title: 'Write API documentation',
      description: 'Document all API endpoints with OpenAPI spec',
      status: TaskStatus.OPEN,
      priority: TaskPriority.LOW,
      assignedTo: users[0].id,
      createdById: users[1].id,
    },
  });

  console.log('Seed complete!');
  console.log('Demo users:');
  console.log('  - alice@example.com (America/Los_Angeles)');
  console.log('  - bob@example.com (Europe/London)');
  console.log('  - carol@example.com (Asia/Tokyo)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
