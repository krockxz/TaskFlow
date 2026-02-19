/**
 * GitHub Sync API
 *
 * Manually triggers a sync from GitHub Issues to TaskFlow tasks.
 * Uses encrypted server-side storage for tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { importGitHubIssues } from '@/lib/github/sync';
import { getAuthUser } from '@/lib/supabase/server';
import { getGitHubToken } from '@/lib/github/service';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { repoOwner, repoName } = body;

    if (!repoOwner || !repoName) {
      return NextResponse.json(
        { error: 'repoOwner and repoName are required' },
        { status: 400 }
      );
    }

    // Get GitHub access token from encrypted storage
    const githubToken = await getGitHubToken(user.id);
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected. Please connect your account first.' },
        { status: 400 }
      );
    }

    const result = await importGitHubIssues(repoOwner, repoName, githubToken, user.id);

    return NextResponse.json({
      success: true,
      created: result.created,
      updated: result.updated,
      errors: result.errors,
    });
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync from GitHub' },
      { status: 500 }
    );
  }
}
