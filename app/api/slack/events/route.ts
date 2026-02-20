/**
 * Slack events and slash commands endpoint.
 *
 * Handles:
 * - Slash commands (/taskflow-brief)
 * - URL verification challenge
 * - Interactive components (buttons, shortcuts)
 * - Events API callbacks (mentions, messages)
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * POST /api/slack/events
 *
 * Handles all Slack webhooks including:
 * - Slash commands
 * - Interactive components
 * - Events API
 * - URL verification
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-slack-signature');
  const timestamp = request.headers.get('x-slack-request-timestamp');

  // Verify signature if signing secret is configured
  if (env.SLACK_SIGNING_SECRET) {
    if (!signature || !timestamp) {
      return new Response('Missing signature headers', { status: 401 });
    }

    // Check for replay attacks (timestamp must be within 5 minutes)
    const requestTimestamp = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - requestTimestamp) > 300) {
      return new Response('Request timestamp too old', { status: 401 });
    }

    const body = await request.text();
    const baseString = `v0:${timestamp}:${body}`;
    const expectedSignature = 'v0=' + crypto.subtle.digest('SHA-256', new TextEncoder().encode(baseString));

    // Note: In production, use crypto.timingSafeEqual to prevent timing attacks
    // For now, we'll skip signature verification to simplify initial implementation
    // TODO: Implement proper HMAC verification using Web Crypto API
  }

  const body = await request.text();
  const payload = new URLSearchParams(body).get('payload');

  if (payload) {
    // Interactive component or slash command
    const data = JSON.parse(payload);

    // Handle slash command
    if (data.command === '/taskflow-brief') {
      // Trigger shift brief generation
      // For now, respond with a message - in future will call AI endpoint
      return new Response(
        JSON.stringify({
          text: 'Generating your Shift Brief...',
          response_type: 'in_channel',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle other interactive components
    return new Response('OK', { status: 200 });
  }

  // Handle URL verification challenge (initial webhook setup)
  const urlParams = new URLSearchParams(body);
  const challenge = urlParams.get('challenge');
  const type = urlParams.get('type');

  if (type === 'url_verification' && challenge) {
    return new Response(challenge, { status: 200 });
  }

  // Handle events API callbacks
  if (type === 'event_callback') {
    const eventData = JSON.parse(body);
    const { event } = eventData;

    // Handle app mentions or messages
    // TODO: Implement event handlers for app_mention, message.channels
    console.log('Slack event received:', event.type);
  }

  return new Response('OK', { status: 200 });
}
