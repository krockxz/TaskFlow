/**
 * GitHub Repos API
 *
 * Fetches user's GitHub repositories.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get GitHub access token from user metadata
    const githubToken = user.user_metadata?.github_access_token;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected. Please connect your account first.' },
        { status: 400 }
      );
    }

    // Fetch repos from GitHub
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

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
      repos: repos.map((repo: unknown) => ({
        id: (repo as any).id,
        name: (repo as any).name,
        full_name: (repo as any).full_name,
        owner: {
          login: (repo as any).owner.login,
          avatar_url: (repo as any).owner.avatar_url,
        },
        description: (repo as any).description,
        private: (repo as any).private,
        html_url: (repo as any).html_url,
      })),
    });
  } catch (error) {
    console.error('GitHub repos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
