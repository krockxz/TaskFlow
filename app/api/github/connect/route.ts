/**
 * GitHub Connect API
 *
 * Manages GitHub account connection for the user.
 * Uses encrypted server-side storage for tokens - tokens are NEVER sent to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import {
  storeGitHubToken,
  deleteGitHubToken,
  getGitHubUserInfo,
} from '@/lib/github/service';

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
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Store the encrypted token (verifies it works first)
    const githubUser = await storeGitHubToken(user.id, accessToken);

    return NextResponse.json({
      success: true,
      githubUser: {
        login: githubUser.login,
        avatar_url: githubUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error('GitHub connect error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect GitHub account' },
      { status: error instanceof Error && error.message.includes('Invalid') ? 400 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the encrypted token from database
    await deleteGitHubToken(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GitHub disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect GitHub account' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check GitHub connection status.
 * Returns user info WITHOUT the token.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const githubInfo = await getGitHubUserInfo(user.id);

    if (!githubInfo) {
      return NextResponse.json({
        connected: false,
        githubUser: null,
      });
    }

    return NextResponse.json({
      connected: true,
      githubUser: {
        login: githubInfo.login,
        avatar_url: githubInfo.avatarUrl,
      },
    });
  } catch (error) {
    console.error('GitHub status error:', error);
    return NextResponse.json(
      { error: 'Failed to get GitHub status' },
      { status: 500 }
    );
  }
}
