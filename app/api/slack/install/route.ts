/**
 * Slack OAuth installation endpoint.
 *
 * Handles the OAuth flow for installing the app to Slack workspaces.
 * Implements OAuth flow directly for Next.js compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * GET /api/slack/install
 *
 * Initiates the OAuth flow by redirecting user to Slack authorization page.
 */
export async function GET(request: NextRequest) {
  if (!env.SLACK_CLIENT_ID) {
    return NextResponse.json({ error: 'Slack not configured' }, { status: 500 });
  }

  const state = Math.random().toString(36).substring(7);
  const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/slack/install/callback`;

  const authUrl = new URL('https://slack.com/oauth/v2/authorize');
  authUrl.searchParams.set('client_id', env.SLACK_CLIENT_ID);
  authUrl.searchParams.set('scope', 'chat:write,chat:write.public,commands,incoming-webhook');
  authUrl.searchParams.set('user_scope', '');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}

/**
 * POST /api/slack/install
 *
 * Reserved for future use (e.g., state verification endpoint)
 */
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
