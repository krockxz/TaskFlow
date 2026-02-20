/**
 * Slack OAuth installation endpoint.
 *
 * Handles the OAuth flow for installing the app to Slack workspaces.
 * Delegates to @slack/oauth installer for state management and token exchange.
 */

import { installer } from '@/lib/slack/oauth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/slack/install
 *
 * Initiates the OAuth flow by redirecting user to Slack authorization page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const result = await installer.handleInstallPath(request, url);

  // Handle the response from the installer
  if (result instanceof Response) {
    return result;
  }

  // If installer returns something else, wrap it in NextResponse
  return NextResponse.json(result);
}

/**
 * POST /api/slack/install
 *
 * Handles the OAuth callback from Slack after user authorizes the app.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const result = await installer.handleInstallPath(request, url);

  // Handle the response from the installer
  if (result instanceof Response) {
    return result;
  }

  // If installer returns something else, wrap it in NextResponse
  return NextResponse.json(result);
}
