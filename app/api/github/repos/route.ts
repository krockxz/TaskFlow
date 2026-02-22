/**
 * GitHub Repos API
 *
 * Fetches user's GitHub repositories.
 * Uses encrypted server-side storage for tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { fetchGitHubAPI } from '@/lib/github/service';

interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  private: boolean;
  html_url: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch repos from GitHub using the service
    const response = await fetchGitHubAPI(
      user.id,
      '/user/repos?sort=updated&per_page=100'
    );

    if (!response.ok) {
      if (response.status === 403) {
        const reset = response.headers.get('X-RateLimit-Reset');
        return NextResponse.json(
          {
            error: 'GitHub API rate limit exceeded',
            resetAt: reset ? new Date(parseInt(reset) * 1000).toISOString() : null,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const repos = await response.json();

    return NextResponse.json({
      success: true,
      repos: repos.map((repo: GitHubRepoResponse) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
        },
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
      })),
    });
  } catch (error) {
    console.error('GitHub repos error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repositories' },
      { status: error instanceof Error && error.message.includes('not connected') ? 400 : 500 }
    );
  }
}
