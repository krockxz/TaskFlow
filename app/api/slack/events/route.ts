/**
 * Slack events and slash commands endpoint.
 *
 * Handles:
 * - Slash commands (/taskflow-brief)
 * - URL verification challenge
 * - Interactive components (buttons, shortcuts)
 * - Events API callbacks (mentions, messages)
 *
 * SECURITY: All requests must be signed by Slack using the signing secret.
 * Signature verification is MANDATORY and cannot be bypassed.
 *
 * @see https://api.slack.com/authentication/verifying-requests-from-slack
 */

import { NextRequest } from 'next/server';
import { verifySlackRequest } from '@/lib/slack/verification';

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
  // Get raw body for signature verification
  const body = await request.text();

  // Verify signature - MANDATORY for all requests
  const verification = verifySlackRequest(request, body);
  if (!verification.valid) {
    return verification.response;
  }

  // Parse the body
  const formData = new URLSearchParams(body);
  const payload = formData.get('payload');

  if (payload) {
    // Interactive component (button click, etc.)
    try {
      const data = JSON.parse(payload);

      // Handle button actions
      if (data.type === 'block_actions') {
        const action = data.actions?.[0];
        if (action?.action_id === 'open_task') {
          // Button click to open task - redirect to task URL
          // This is handled client-side by Slack
          return new Response('OK', { status: 200 });
        }
      }
    } catch (error) {
      console.error('Error parsing payload:', error);
    }

    return new Response('OK', { status: 200 });
  }

  // Check for slash command
  const command = formData.get('command');
  if (command === '/taskflow-brief') {
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

  // Handle URL verification challenge (initial webhook setup)
  const urlParams = new URLSearchParams(body);
  const challenge = urlParams.get('challenge');
  const type = urlParams.get('type');

  if (type === 'url_verification' && challenge) {
    return new Response(challenge, { status: 200 });
  }

  // Handle events API callbacks
  if (type === 'event_callback') {
    try {
      const eventData = JSON.parse(body);
      const { event } = eventData;

      // Handle app mentions or messages
      // TODO: Implement event handlers for app_mention, message.channels
      console.log('Slack event received:', event.type);
    } catch (error) {
      console.error('Error parsing event callback:', error);
    }
  }

  return new Response('OK', { status: 200 });
}
