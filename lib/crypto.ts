/**
 * Cryptography utilities for secure data encryption/decryption.
 *
 * Uses AES-256-GCM for authenticated encryption, providing both
 * confidentiality and integrity protection.
 */

import { env } from '@/lib/env';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Key derivation parameters
const SALT = 'taskflow-github-token-salt'; // In production, use unique salt per encryption
const KEY_LENGTH = 32; // 256 bits for AES-256
const IV_LENGTH = 16; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Derives a consistent encryption key from the environment key using scrypt.
 * Scrypt is memory-hard and resistant to brute force attacks.
 */
function deriveKey(): Buffer {
  return scryptSync(env.ENCRYPTION_KEY, SALT, KEY_LENGTH);
}

/**
 * Encrypts plaintext using AES-256-GCM.
 *
 * The output format is: iv (16 bytes) + auth_tag (16 bytes) + ciphertext
 *
 * @param plaintext - The sensitive data to encrypt (e.g., GitHub access token)
 * @returns Base64-encoded encrypted data (IV + auth tag + ciphertext)
 */
export function encrypt(plaintext: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from('taskflow')); // Additional authenticated data

  let ciphertext = cipher.update(plaintext, 'utf8');
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);

  // Get auth tag (must be called after final())
  const authTag = cipher.getAuthTag();

  // Combine: IV + auth_tag + ciphertext
  const combined = Buffer.concat([iv, authTag, ciphertext]);

  return combined.toString('base64');
}

/**
 * Decrypts data encrypted with the encrypt() function.
 *
 * @param encryptedData - Base64-encoded encrypted data (IV + auth tag + ciphertext)
 * @returns The original plaintext
 * @throws Error if decryption fails or authentication tag is invalid
 */
export function decrypt(encryptedData: string): string {
  const key = deriveKey();
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract IV, auth tag, and ciphertext
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  decipher.setAAD(Buffer.from('taskflow')); // Must match encryption

  let plaintext = decipher.update(ciphertext);
  plaintext = Buffer.concat([plaintext, decipher.final()]);

  return plaintext.toString('utf8');
}

/**
 * EncryptionService class for managing encrypted GitHub tokens.
 * Provides a clean interface for token storage operations.
 */
export class EncryptionService {
  /**
   * Encrypts a GitHub access token for storage.
   */
  static encryptToken(token: string): string {
    return encrypt(token);
  }

  /**
   * Decrypts a GitHub access token from storage.
   */
  static decryptToken(encryptedToken: string): string {
    return decrypt(encryptedToken);
  }
}
