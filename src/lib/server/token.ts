import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/**
 * Game state travels to the browser as an encrypted token, so the answer is
 * never readable on the client and the server needs no database.
 * AES-256-GCM: the token can be neither read nor altered without the secret.
 */

const DEV_SECRET = 'chassiscode-development-secret-not-for-production';
let warned = false;

function key(): Buffer {
  const secret = process.env.GAME_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GAME_SECRET is not set. Add it to the environment (see .env.example).');
    }
    if (!warned) {
      console.warn('GAME_SECRET is not set; using the built-in development secret.');
      warned = true;
    }
  }
  return createHash('sha256').update(secret || DEV_SECRET).digest();
}

export function seal(payload: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
}

/** Returns null if the token is malformed, tampered with, or from another secret. */
export function open<T>(token: string): T | null {
  try {
    const raw = Buffer.from(token, 'base64url');
    if (raw.length < 29) return null;
    const decipher = createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const body = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
    return JSON.parse(body.toString('utf8')) as T;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('GAME_SECRET')) throw e;
    return null;
  }
}
