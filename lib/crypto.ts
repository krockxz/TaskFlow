/**
 * Cryptography utilities for secure data encryption/decryption.
 *
 * Uses AES-256-GCM for authenticated encryption, providing both
 * confidentiality and integrity protection.
 */

import { env } from '@/lib/env';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const SALT = 'taskflow-github-token-salt';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function deriveKey(): Buffer {
  return scryptSync(env.ENCRYPTION_KEY, SALT, KEY_LENGTH);
}

export function encryptToken(token: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from('taskflow'));

  let ciphertext = cipher.update(token, 'utf8');
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);

  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, ciphertext]);

  return combined.toString('base64');
}

export function decryptToken(encryptedToken: string): string {
  const key = deriveKey();
  const combined = Buffer.from(encryptedToken, 'base64');

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  decipher.setAAD(Buffer.from('taskflow'));

  let plaintext = decipher.update(ciphertext);
  plaintext = Buffer.concat([plaintext, decipher.final()]);

  return plaintext.toString('utf8');
}
