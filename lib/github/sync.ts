/**
 * GitHub Sync Utilities
 *
 * Functions for syncing GitHub Issues with TaskFlow tasks.
 */

import { createClient } from '@/lib/supabase/client';
import type { GitHubIssue, Task, TaskStatus, TaskPriority } from '@/lib/types';

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
 * Import GitHub issues as tasks
 */
export async function importGitHubIssues(
  repoOwner: string,
  repoName: string,
  accessToken: string
): Promise<{ created: number; updated: number; errors: string[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

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
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('github_issue_url', issue.html_url)
        .single();

      const taskData = {
        title: issue.title,
        description: issue.body || '',
        status: mapIssueStateToTaskStatus(issue.state),
        priority: mapLabelsToPriority(issue.labels),
        github_issue_url: issue.html_url,
        github_issue_number: issue.number,
        github_repo: `${repoOwner}/${repoName}`,
        updated_at: new Date().toISOString(),
      };

      if (existingTask) {
        // Update existing task
        await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', existingTask.id);
        updated++;
      } else {
        // Create new task
        await supabase
          .from('tasks')
          .insert({
            ...taskData,
            created_by: user.id,
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
 * Find task by GitHub issue URL
 */
export async function findTaskByGitHubIssueUrl(issueUrl: string): Promise<Task | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('github_issue_url', issueUrl)
    .single();

  return data;
}

/**
 * Update task status based on GitHub webhook
 */
export async function handleGitHubWebhook(payload: unknown): Promise<{ success: boolean; message?: string }> {
  const supabase = createClient();

  // Type guard for webhook payload
  if (typeof payload !== 'object' || payload === null) {
    return { success: false, message: 'Invalid payload' };
  }

  const p = payload as Record<string, unknown>;

  // Handle issue webhook
  if (p.action === 'closed' && p.issue) {
    const issue = p.issue as { html_url: string; number: number };
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('github_issue_url', issue.html_url)
      .single();

    if (task) {
      await supabase
        .from('tasks')
        .update({ status: 'DONE' })
        .eq('id', task.id);

      return { success: true, message: `Task ${task.id} marked as done` };
    }
  }

  // Handle PR merged webhook
  if (p.action === 'closed' && p.pull_request) {
    const pr = p.pull_request as { html_url: string; merged: boolean };
    if (pr.merged) {
      const { data: task } = await supabase
        .from('tasks')
        .select('id')
        .eq('github_pr_url', pr.html_url)
        .single();

      if (task) {
        await supabase
          .from('tasks')
          .update({ status: 'DONE' })
          .eq('id', task.id);

        return { success: true, message: `Task ${task.id} marked as done` };
      }
    }
  }

  return { success: true };
}
