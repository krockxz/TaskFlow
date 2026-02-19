/**
 * GitHub Webhook Handler
 *
 * Receives webhook events from GitHub and updates TaskFlow tasks accordingly.
 * Implements HMAC signature verification for security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleGitHubWebhook } from '@/lib/github/sync';
import { env } from '@/lib/env';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify GitHub webhook signature.
 *
 * GitHub sends a signature in the x-hub-signature-256 header as:
 * sha256=<HMAC-SHA256-of-payload>
 *
 * We compute our own HMAC using the shared secret and compare securely.
 *
 * @param signature - The signature header from GitHub (format: sha256=<hex>)
 * @param payload - The raw request body as string
 * @returns true if signature is valid, false otherwise
 */
function verifySignature(signature: string | null, payload: string): boolean {
  if (!signature) {
    return false;
  }

  // Extract the hash from the signature header
  const [algorithm, hash] = signature.split('=');

  // GitHub uses SHA-256
  if (algorithm !== 'sha256') {
    return false;
  }

  // Compute HMAC using the shared secret
  const hmac = createHmac('sha256', env.GITHUB_WEBHOOK_SECRET);
  hmac.update(payload);
  const digest = hmac.digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  // We need buffers of the same length for timingSafeEqual
  const hashBuffer = Buffer.from(hash);
  const digestBuffer = Buffer.from(digest);

  if (hashBuffer.length !== digestBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, digestBuffer);
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const signature = request.headers.get('x-hub-signature-256');
    if (!signature || !verifySignature(signature, rawBody)) {
      console.error('Invalid GitHub webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the verified payload
    const payload = JSON.parse(rawBody);

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
