/**
 * GitHub API Client
 *
 * Handles all GitHub API interactions for TaskFlow.
 */

import type { GitHubRepo, GitHubIssue } from '@/lib/types';

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export class GitHubRateLimitError extends Error {
  constructor(
    public retryAfter: number,
    message = 'GitHub API rate limit exceeded'
  ) {
    super(message);
    this.name = 'GitHubRateLimitError';
  }
}

export interface CreateIssueInput {
  title: string;
  body: string;
  labels?: string[];
}

export interface UpdateIssueInput {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  labels?: string[];
}

export class GitHubClient {
  constructor(private accessToken: string) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `https://api.github.com${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
      },
    });

    // Check rate limits
    const remaining = response.headers.get('X-RateLimit-Remaining');
    if (remaining === '0') {
      const reset = response.headers.get('X-RateLimit-Reset');
      if (reset) {
        const retryAfter = parseInt(reset) * 1000 - Date.now();
        throw new GitHubRateLimitError(retryAfter);
      }
    }

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new GitHubApiError(
        `GitHub API error: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get user's repositories
   */
  async getUserRepos(): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>('/user/repos?sort=updated&per_page=100');
  }

  /**
   * Get issues from a repository
   */
  async getIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    return this.request<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?state=${state}&per_page=100`);
  }

  /**
   * Get a single issue
   */
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  /**
   * Create a new issue
   */
  async createIssue(owner: string, repo: string, input: CreateIssueInput): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Update an existing issue
   */
  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    input: UpdateIssueInput
  ): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get authenticated user info
   */
  async getUser(): Promise<{ login: string; avatar_url: string; id: number }> {
    return this.request('/user');
  }
}

/**
 * Create a GitHub client from a stored access token
 */
export async function createGitHubClient(): Promise<GitHubClient | null> {
  // In a real implementation, you'd fetch the token from:
  // 1. User metadata in Supabase
  // 2. A separate database table
  // 3. Session storage

  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get GitHub token from user metadata
  const githubToken = user.user_metadata?.github_access_token;
  if (!githubToken) {
    return null;
  }

  return new GitHubClient(githubToken);
}
