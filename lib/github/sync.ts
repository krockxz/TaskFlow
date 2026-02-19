/**
 * GitHub Sync Utilities
 *
 * Functions for syncing GitHub Issues with TaskFlow tasks.
 * Uses Prisma for all database operations to ensure consistency.
 */

import prisma from '@/lib/prisma';
import type { TaskStatus, TaskPriority, GitHubIssue } from '@/lib/types';

/**
 * Map GitHub issue state to TaskFlow task status
 */
function mapIssueStateToTaskStatus(issueState: string): TaskStatus {
  switch (issueState) {
    case 'closed':
      return 'DONE';
    default:
      return 'OPEN';
  }
}

/**
 * Map GitHub labels to TaskFlow priority
 */
function mapLabelsToPriority(labels: { name: string }[]): TaskPriority {
  const labelNames = labels.map(l => l.name.toLowerCase());

  if (labelNames.some(l => l.includes('critical') || l.includes('urgent'))) {
    return 'HIGH';
  }
  if (labelNames.some(l => l.includes('low'))) {
    return 'LOW';
  }
  return 'MEDIUM';
}

/**
 * Import GitHub issues as tasks (user-initiated)
 *
 * This function is used when a user explicitly imports issues from GitHub.
 * It uses the user's ID for the created_by field.
 */
export async function importGitHubIssues(
  repoOwner: string,
  repoName: string,
  accessToken: string,
  userId: string
): Promise<{ created: number; updated: number; errors: string[] }> {
  // Fetch issues from GitHub
  const issuesResponse = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/issues?state=all&per_page=100`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!issuesResponse.ok) {
    throw new Error(`GitHub API error: ${issuesResponse.statusText}`);
  }

  const issues: GitHubIssue[] = await issuesResponse.json();
  const errors: string[] = [];
  let created = 0;
  let updated = 0;

  for (const issue of issues) {
    // Skip pull requests
    if (issue.pull_request) {
      continue;
    }

    try {
      // Check if task already exists for this issue
      const existingTask = await prisma.task.findFirst({
        where: { githubIssueUrl: issue.html_url },
      });

      const taskData = {
        title: issue.title,
        description: issue.body || '',
        status: mapIssueStateToTaskStatus(issue.state),
        priority: mapLabelsToPriority(issue.labels),
        githubIssueUrl: issue.html_url,
        githubIssueNumber: issue.number,
        githubRepo: `${repoOwner}/${repoName}`,
      };

      if (existingTask) {
        // Update existing task
        await prisma.task.update({
          where: { id: existingTask.id },
          data: taskData,
        });
        updated++;
      } else {
        // Create new task
        await prisma.task.create({
          data: {
            ...taskData,
            createdById: userId,
          },
        });
        created++;
      }
    } catch (error) {
      errors.push(`Failed to sync issue #${issue.number}: ${error}`);
    }
  }

  return { created, updated, errors };
}

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
