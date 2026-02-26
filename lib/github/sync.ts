/**
 * GitHub Webhook Handler
 *
 * Handles webhook events from GitHub to update TaskFlow tasks.
 * Uses Prisma for all database operations to ensure consistency.
 */

import prisma from '@/lib/prisma';

/**
 * Find task by GitHub issue URL using Prisma
 */
export async function findTaskByGitHubIssueUrl(issueUrl: string) {
  return await prisma.task.findFirst({
    where: { githubIssueUrl: issueUrl },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
  });
}

/**
 * Find task by GitHub PR URL using Prisma
 */
export async function findTaskByGitHubPrUrl(prUrl: string) {
  return await prisma.task.findFirst({
    where: { githubPrUrl: prUrl },
    include: {
      createdBy: { select: { id: true, email: true } },
      assignedToUser: { select: { id: true, email: true } },
    },
  });
}

/**
 * System user ID for webhook operations.
 *
 * This is used to track that a task was updated by the GitHub webhook system
 * rather than a human user. The system user should exist in the database.
 */
const GITHUB_SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Get or create the GitHub system user.
 *
 * This user is used as the "changed_by" for events triggered by webhooks.
 * In production, you should create this user manually and store its ID in config.
 */
async function getGitHubSystemUser(): Promise<string> {
  let systemUser = await prisma.user.findUnique({
    where: { id: GITHUB_SYSTEM_USER_ID },
  });

  if (!systemUser) {
    // Create the system user if it doesn't exist
    systemUser = await prisma.user.create({
      data: {
        id: GITHUB_SYSTEM_USER_ID,
        email: 'github@taskflow.system',
      },
    });
  }

  return systemUser.id;
}

/**
 * Update task status based on GitHub webhook (system operation)
 *
 * This function is called by the webhook handler and uses Prisma directly,
 * bypassing RLS since it's a trusted server-side operation.
 */
export async function handleGitHubWebhook(payload: unknown): Promise<{ success: boolean; message?: string }> {
  // Type guard for webhook payload
  if (typeof payload !== 'object' || payload === null) {
    return { success: false, message: 'Invalid payload' };
  }

  const p = payload as Record<string, unknown>;

  // Get the system user ID for event logging
  const systemUserId = await getGitHubSystemUser();

  // Handle issue webhook - when an issue is closed
  if (p.action === 'closed' && p.issue) {
    const issue = p.issue as { html_url: string; number: number; title: string };

    const task = await findTaskByGitHubIssueUrl(issue.html_url);

    if (task && task.status !== 'DONE') {
      const oldStatus = task.status;

      // Update task status
      await prisma.task.update({
        where: { id: task.id },
        data: { status: 'DONE' },
      });

      // Create event log for audit trail
      await prisma.taskEvent.create({
        data: {
          taskId: task.id,
          eventType: 'STATUS_CHANGED',
          oldStatus: oldStatus,
          newStatus: 'DONE',
          changedById: systemUserId,
        },
      });

      // Create notification for the task creator and assignee
      const notificationMessage = `GitHub issue "${issue.title}" was closed. Task marked as done.`;

      if (task.createdById !== systemUserId) {
        await prisma.notification.create({
          data: {
            userId: task.createdById,
            taskId: task.id,
            message: notificationMessage,
          },
        });
      }

      if (task.assignedTo && task.assignedTo !== task.createdById && task.assignedTo !== systemUserId) {
        await prisma.notification.create({
          data: {
            userId: task.assignedTo,
            taskId: task.id,
            message: notificationMessage,
          },
        });
      }

      return { success: true, message: `Task ${task.id} marked as done via GitHub webhook` };
    }
  }

  // Handle issue reopened webhook
  if (p.action === 'reopened' && p.issue) {
    const issue = p.issue as { html_url: string; title: string };

    const task = await findTaskByGitHubIssueUrl(issue.html_url);

    if (task && task.status === 'DONE') {
      const oldStatus = task.status;

      // Update task status back to OPEN
      await prisma.task.update({
        where: { id: task.id },
        data: { status: 'OPEN' },
      });

      // Create event log
      await prisma.taskEvent.create({
        data: {
          taskId: task.id,
          eventType: 'STATUS_CHANGED',
          oldStatus: oldStatus,
          newStatus: 'OPEN',
          changedById: systemUserId,
        },
      });

      return { success: true, message: `Task ${task.id} reopened via GitHub webhook` };
    }
  }

  // Handle PR merged webhook
  if (p.action === 'closed' && p.pull_request) {
    const pr = p.pull_request as { html_url: string; merged: boolean; merged_at: string | null; title: string };

    if (pr.merged) {
      const task = await findTaskByGitHubPrUrl(pr.html_url);

      if (task && task.status !== 'DONE') {
        const oldStatus = task.status;

        // Update task status
        await prisma.task.update({
          where: { id: task.id },
          data: { status: 'DONE' },
        });

        // Create event log
        await prisma.taskEvent.create({
          data: {
            taskId: task.id,
            eventType: 'STATUS_CHANGED',
            oldStatus: oldStatus,
            newStatus: 'DONE',
            changedById: systemUserId,
          },
        });

        // Create notification
        const notificationMessage = `GitHub PR "${pr.title}" was merged. Task marked as done.`;

        if (task.createdById !== systemUserId) {
          await prisma.notification.create({
            data: {
              userId: task.createdById,
              taskId: task.id,
              message: notificationMessage,
            },
          });
        }

        if (task.assignedTo && task.assignedTo !== task.createdById && task.assignedTo !== systemUserId) {
          await prisma.notification.create({
            data: {
              userId: task.assignedTo,
              taskId: task.id,
              message: notificationMessage,
            },
          });
        }

        return { success: true, message: `Task ${task.id} marked as done via GitHub PR merge` };
      }
    }
  }

  return { success: true };
}
