/**
 * Slack OAuth callback endpoint.
 *
 * Handles the OAuth callback from Slack after user authorizes the app.
 * Exchanges authorization code for access tokens and stores in database.
 *
 * SECURITY: Verifies OAuth state parameter to prevent CSRF attacks
 * and ensure the installation is linked to the correct user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import prisma from '@/lib/prisma';
import { EncryptionService } from '@/lib/crypto';
import { verifyOAuthState } from '@/lib/slack/oauth';

/**
 * GET /api/slack/install/callback
 *
 * Handles the OAuth callback from Slack.
 * Query parameters: code, state, error (if user denied)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle user denial
    if (error) {
      console.error('Slack OAuth denied by user:', error);
      return NextResponse.redirect(new URL('/settings/slack?error=denied', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/settings/slack?error=no_code', request.url));
    }

    // Verify state parameter to get TaskFlow user ID
    if (!state) {
      console.error('Slack OAuth callback missing state parameter');
      return NextResponse.redirect(new URL('/settings/slack?error=invalid_state', request.url));
    }

    const taskFlowUserId = verifyOAuthState(state);
    if (!taskFlowUserId) {
      console.error('Slack OAuth callback invalid or expired state');
      return NextResponse.redirect(new URL('/settings/slack?error=invalid_state', request.url));
    }

    // Exchange code for access tokens
    const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/slack/install/callback`;
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.SLACK_CLIENT_ID!,
        client_secret: env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack OAuth error:', tokenData);
      return NextResponse.redirect(new URL('/settings/slack?error=oauth_failed', request.url));
    }

    const { team, enterprise, authed_user, bot, access_token, scope } = tokenData;

    // Store installation in database
    // userId: TaskFlow user UUID (from OAuth state)
    // slackUserId: Slack user ID (from authed_user.id)
    await prisma.slackInstallation.upsert({
      where: { teamId: team.id },
      create: {
        teamId: team.id,
        enterpriseId: enterprise?.id,
        userId: taskFlowUserId,
        slackUserId: authed_user.id,
        accessToken: access_token ? EncryptionService.encryptToken(access_token) : '',
        botAccessToken: EncryptionService.encryptToken(bot?.token || ''),
        scope: scope || '',
      },
      update: {
        userId: taskFlowUserId,
        slackUserId: authed_user.id,
        accessToken: access_token ? EncryptionService.encryptToken(access_token) : '',
        botAccessToken: EncryptionService.encryptToken(bot?.token || ''),
        scope: scope || '',
      },
    });

    // Redirect to settings page with success flag
    return NextResponse.redirect(new URL('/settings/slack?installed=true', request.url));
  } catch (error) {
    console.error('Slack OAuth callback error:', error);
    return NextResponse.redirect(new URL('/settings/slack?error=server_error', request.url));
  }
}
