/**
 * Slack signature verification utilities.
 *
 * This module provides functions to verify incoming Slack requests
 * using Slack's signing secret mechanism.
 *
 * @see https://api.slack.com/authentication/verifying-requests-from-slack
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '@/lib/env';

/**
 * Maximum allowed timestamp difference in seconds (5 minutes).
 * This prevents replay attacks.
 */
const MAX_TIMESTAMP_DIFF = 300;

/**
 * Result of signature verification.
 */
export interface VerificationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Verifies a Slack request signature.
 *
 * This function implements Slack's recommended verification pattern:
 * 1. Check that signing secret is configured
 * 2. Verify signature headers are present
 * 3. Check timestamp is within allowed range (prevents replay attacks)
 * 4. Verify HMAC signature using timing-safe comparison
 *
 * @param signature - The X-Slack-Signature header value (e.g., "v0=abcdef...")
 * @param timestamp - The X-Slack-Request-Timestamp header value (Unix timestamp)
 * @param body - The raw request body as a string
 * @returns Verification result with valid flag and optional reason for failure
 */
export function verifySlackSignature(
  signature: string | null,
  timestamp: string | null,
  body: string
): VerificationResult {
  // 1. Check signing secret is configured
  if (!env.SLACK_SIGNING_SECRET) {
    return {
      valid: false,
      reason: 'Slack signing secret not configured',
    };
  }

  // 2. Verify required headers are present
  if (!signature || !timestamp) {
    return {
      valid: false,
      reason: 'Missing required signature headers',
    };
  }

  // 3. Parse and validate timestamp
  const requestTimestamp = parseInt(timestamp, 10);
  if (isNaN(requestTimestamp)) {
    return {
      valid: false,
      reason: 'Invalid timestamp format',
    };
  }

  // Check for replay attacks (timestamp must be within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - requestTimestamp) > MAX_TIMESTAMP_DIFF) {
    return {
      valid: false,
      reason: 'Request timestamp too old or too new',
    };
  }

  // 4. Verify HMAC signature
  // Format: v0:<timestamp>:<body>
  const baseString = `v0:${timestamp}:${body}`;
  const expectedSignature = 'v0=' + createHmac('sha256', env.SLACK_SIGNING_SECRET)
    .update(baseString)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  // Check lengths first (timingSafeEqual throws if lengths differ)
  if (signatureBuffer.length !== expectedBuffer.length) {
    return {
      valid: false,
      reason: 'Invalid signature',
    };
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return {
      valid: false,
      reason: 'Signature verification failed',
    };
  }

  return { valid: true };
}

/**
 * Creates a standardized error response for failed signature verification.
 *
 * @param reason - The reason for verification failure
 * @returns A Response object with 401 status
 */
export function createSignatureErrorResponse(reason: string): Response {
  // Log the failure for security monitoring
  console.warn(`[Slack] Signature verification failed: ${reason}`);

  return new Response(`Signature verification failed: ${reason}`, {
    status: 401,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

/**
 * Middleware-style wrapper for Next.js API routes that require Slack signature verification.
 *
 * Usage:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const body = await request.text();
 *   const result = verifySlackRequest(request, body);
 *   if (!result.valid) return result.response;
 *
 *   // Process the verified request...
 * }
 * ```
 *
 * @param request - The Next.js request object
 * @param body - The raw request body as a string
 * @returns Object with valid flag and error response if invalid
 */
export function verifySlackRequest(
  request: Request,
  body: string
): { valid: true } | { valid: false; response: Response } {
  const signature = request.headers.get('x-slack-signature');
  const timestamp = request.headers.get('x-slack-request-timestamp');

  const result = verifySlackSignature(signature, timestamp, body);

  if (!result.valid) {
    return {
      valid: false,
      response: createSignatureErrorResponse(result.reason || 'Unknown error'),
    };
  }

  return { valid: true };
}
