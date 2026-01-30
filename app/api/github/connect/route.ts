/**
 * GitHub Connect API
 *
 * Manages GitHub account connection for the user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    // Verify the token works by fetching user info
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid GitHub access token' },
        { status: 400 }
      );
    }

    const githubUser = await response.json();

    // Store token in user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        github_access_token: accessToken,
        github_login: githubUser.login,
        github_avatar: githubUser.avatar_url,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      githubUser: {
        login: githubUser.login,
        avatar_url: githubUser.avatar_url,
      },
    });
  } catch (error) {
    console.error('GitHub connect error:', error);
    return NextResponse.json(
      { error: 'Failed to connect GitHub account' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove GitHub credentials from user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        github_access_token: null,
        github_login: null,
        github_avatar: null,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GitHub disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect GitHub account' },
      { status: 500 }
    );
  }
}
