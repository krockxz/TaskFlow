/**
 * GitHub Webhook Handler
 *
 * Receives webhook events from GitHub and updates TaskFlow tasks accordingly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleGitHubWebhook } from '@/lib/github/sync';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-hub-signature-256');
    // if (!signature || !verifySignature(signature, await request.text())) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const payload = await request.json();

    // Log webhook for debugging
    console.log('GitHub webhook received:', {
      action: payload.action,
      type: payload.pull_request ? 'pull_request' : payload.issue ? 'issue' : 'unknown',
    });

    const result = await handleGitHubWebhook(payload);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GitHub needs GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'webhook ready' });
}
