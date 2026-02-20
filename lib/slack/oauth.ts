/**
 * Slack OAuth installation provider for workspace installation flow.
 *
 * Uses @slack/oauth to handle the OAuth 2.0 flow for installing
 * the app to Slack workspaces. Stores encrypted tokens in the database.
 */

import { InstallProvider, InstallerOptions } from '@slack/oauth';
import { EncryptionService } from '@/lib/crypto';

/**
 * State store for OAuth flow state verification.
 *
 * In production, this should use Redis or the database with TTL.
 * Current implementation uses simplified state verification.
 */
const stateStore = {
  generateStateParam: async () => {
    return Math.random().toString(36).substring(7);
  },
  verifyStateParam: async (_state: string) => {
    // Simplified - production should verify state against Redis/DB
    return true;
  },
};

/**
 * Installation store for saving Slack installation data.
 *
 * Encrypts access tokens before storing in database for security.
 */
const installationStore = {
  storeInstallation: async (installation: any) => {
    const { prisma } = await import('@/lib/prisma');
    const { team, enterprise, user, token } = installation;

    await prisma.slackInstallation.upsert({
      where: { teamId: team.id },
      create: {
        teamId: team.id,
        enterpriseId: enterprise?.id,
        userId: user.id,
        accessToken: token?.access_token
          ? EncryptionService.encryptToken(token.access_token)
          : '',
        botAccessToken: EncryptionService.encryptToken(installation.bot?.token || ''),
        scope: token?.scope || '',
      },
      update: {
        userId: user.id,
        accessToken: token?.access_token
          ? EncryptionService.encryptToken(token.access_token)
          : '',
        botAccessToken: EncryptionService.encryptToken(installation.bot?.token || ''),
        scope: token?.scope || '',
      },
    });

    return true;
  },

  fetchInstallation: async (installQuery: any) => {
    const { prisma } = await import('@/lib/prisma');
    const installation = await prisma.slackInstallation.findUnique({
      where: { teamId: installQuery.teamId },
    });

    if (!installation) return undefined;

    return {
      team: { id: installation.teamId },
      enterprise: installation.enterpriseId ? { id: installation.enterpriseId } : undefined,
      user: {
        id: installation.userId,
        token: {
          access_token: EncryptionService.decryptToken(installation.accessToken),
        },
      },
      bot: {
        token: EncryptionService.decryptToken(installation.botAccessToken),
      },
    };
  },
};

/**
 * Slack OAuth installer configured for Next.js API routes.
 *
 * Handles OAuth flow endpoints for installing the app to workspaces.
 * Tokens are encrypted before database storage.
 */
const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  authVersion: 'v2',
  stateStore,
  installationStore,
  redirectUri: process.env.SLACK_REDIRECT_URI,
});

export { installer };
