/**
 * Slack WebClient singleton for managing API clients per workspace.
 *
 * Maintains a cache of WebClient instances to avoid creating multiple
 * clients for the same workspace, improving performance and resource usage.
 */

import { WebClient } from '@slack/web-api';
import { EncryptionService } from '@/lib/crypto';

interface SlackTokens {
  botAccessToken: string;
  userAccessToken?: string;
}

const clients = new Map<string, WebClient>();

/**
 * Gets or creates a WebClient for a workspace.
 *
 * @param teamId - Slack workspace team ID
 * @param tokens - Access tokens for the workspace
 * @returns WebClient instance configured with the provided tokens
 */
export function getSlackClient(teamId: string, tokens: SlackTokens): WebClient {
  if (clients.has(teamId)) {
    return clients.get(teamId)!;
  }

  const client = new WebClient(tokens.botAccessToken);

  clients.set(teamId, client);
  return client;
}

/**
 * Gets a WebClient for a workspace by fetching tokens from the database.
 *
 * @param teamId - Slack workspace team ID
 * @returns WebClient instance or null if installation not found
 */
export async function getSlackClientByTeam(teamId: string): Promise<WebClient | null> {
  const { prisma } = await import('@/lib/prisma');

  const installation = await prisma.slackInstallation.findUnique({
    where: { teamId },
  });

  if (!installation) {
    return null;
  }

  return getSlackClient(teamId, {
    botAccessToken: EncryptionService.decryptToken(installation.botAccessToken),
    userAccessToken: installation.accessToken
      ? EncryptionService.decryptToken(installation.accessToken)
      : undefined,
  });
}

/**
 * Clears a cached WebClient for a workspace.
 *
 * Use this after token updates to force a new client with fresh credentials.
 *
 * @param teamId - Slack workspace team ID
 */
export function clearSlackClient(teamId: string): void {
  clients.delete(teamId);
}
