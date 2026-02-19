/**
 * GitHub Token Service
 *
 * Server-side service for managing GitHub tokens with encrypted storage.
 * Tokens are never sent to the client - all GitHub API calls happen server-side.
 */

import prisma from '@/lib/prisma';
import { EncryptionService } from '@/lib/crypto';
import type { GitHubToken } from '@prisma/client';

/**
 * Result of storing a GitHub token.
 */
export interface GitHubTokenResult {
  login: string;
  avatarUrl: string;
}

/**
 * Stores an encrypted GitHub token for a user.
 * Verifies the token works by fetching user info from GitHub first.
 *
 * @param userId - The user ID to associate the token with
 * @param accessToken - The GitHub access token to store
 * @returns The GitHub user info (login, avatar)
 * @throws Error if token is invalid
 */
export async function storeGitHubToken(
  userId: string,
  accessToken: string
): Promise<GitHubTokenResult> {
  // Verify the token works by fetching user info
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error('Invalid GitHub access token');
  }

  const githubUser = await response.json();

  // Encrypt the token
  const encryptedToken = EncryptionService.encryptToken(accessToken);

  // Check if token exists for this user
  const existingToken = await prisma.gitHubToken.findFirst({
    where: { userId },
  });

  if (existingToken) {
    // Update existing token
    await prisma.gitHubToken.update({
      where: { id: existingToken.id },
      data: {
        encryptedToken,
        githubLogin: githubUser.login,
        githubAvatar: githubUser.avatar_url,
      },
    });
  } else {
    // Create new token
    await prisma.gitHubToken.create({
      data: {
        userId,
        encryptedToken,
        githubLogin: githubUser.login,
        githubAvatar: githubUser.avatar_url,
      },
    });
  }

  return {
    login: githubUser.login,
    avatarUrl: githubUser.avatar_url,
  };
}

/**
 * Retrieves and decrypts a GitHub token for a user.
 * This should only be called server-side.
 *
 * @param userId - The user ID to get the token for
 * @returns The decrypted access token, or null if not found
 */
export async function getGitHubToken(userId: string): Promise<string | null> {
  const record = await prisma.gitHubToken.findFirst({
    where: { userId },
  });

  if (!record) {
    return null;
  }

  return EncryptionService.decryptToken(record.encryptedToken);
}

/**
 * Gets GitHub user info (login, avatar) without decrypting the token.
 * Safe to send to the client.
 *
 * @param userId - The user ID to get GitHub info for
 * @returns The GitHub user info, or null if not connected
 */
export async function getGitHubUserInfo(
  userId: string
): Promise<{ login: string | null; avatarUrl: string | null } | null> {
  const record = await prisma.gitHubToken.findFirst({
    where: { userId },
    select: {
      githubLogin: true,
      githubAvatar: true,
    },
  });

  if (!record) {
    return null;
  }

  return {
    login: record.githubLogin,
    avatarUrl: record.githubAvatar,
  };
}

/**
 * Deletes a GitHub token for a user (disconnects GitHub account).
 *
 * @param userId - The user ID to remove the token for
 */
export async function deleteGitHubToken(userId: string): Promise<void> {
  const record = await prisma.gitHubToken.findFirst({
    where: { userId },
  });

  if (record) {
    await prisma.gitHubToken.delete({
      where: { id: record.id },
    });
  }
}

/**
 * Makes an authenticated request to the GitHub API on behalf of a user.
 * Handles token decryption automatically.
 *
 * @param userId - The user to make the request for
 * @param endpoint - The GitHub API endpoint (e.g., '/user/repos')
 * @param options - Additional fetch options
 * @returns The fetch response
 * @throws Error if user has no connected GitHub account
 */
export async function fetchGitHubAPI(
  userId: string,
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const token = await getGitHubToken(userId);

  if (!token) {
    throw new Error('GitHub not connected. Please connect your account first.');
  }

  return fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options?.headers,
    },
  });
}
