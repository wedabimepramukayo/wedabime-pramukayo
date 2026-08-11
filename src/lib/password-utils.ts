/**
 * Password Utilities — Cloudflare Workers Compatible
 *
 * Uses PBKDF2 via Web Crypto API (crypto.subtle) for password hashing.
 * Works on both Edge runtime (Cloudflare Workers) and Node.js.
 *
 * Format: pbkdf2:iterations:salt(hash):derivedKey(hash)
 * - Salt: 16 bytes, hex-encoded
 * - Derived key: 32 bytes (256 bits), hex-encoded
 * - Iterations: 100,000 (OWASP recommended minimum for PBKDF2-SHA256)
 */

const ITERATIONS = 100_000;
const SALT_LENGTH = 16; // 16 bytes = 128 bits
const KEY_LENGTH = 32; // 32 bytes = 256 bits
const ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-256';

/**
 * Hash a password using PBKDF2 with a random salt.
 * Returns a string in the format: pbkdf2:iterations:salt:derivedKey
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt using Web Crypto API
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: ALGORITHM },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8 // bits
  );

  // Convert to hex strings
  const saltHex = bufferToHex(salt);
  const keyHex = bufferToHex(new Uint8Array(derivedBits));

  return `pbkdf2:${ITERATIONS}:${saltHex}:${keyHex}`;
}

/**
 * Verify a password against a stored hash.
 * Supports both:
 * - PBKDF2 format: pbkdf2:iterations:salt:derivedKey
 * - bcrypt format: $2a$ or $2b$ (legacy, for migration)
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Check if it's our PBKDF2 format
  if (storedHash.startsWith('pbkdf2:')) {
    return verifyPbkdf2(password, storedHash);
  }

  // Legacy bcrypt support (for any existing users)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    try {
      const bcrypt = await import('bcryptjs');
      return bcrypt.compare(password, storedHash);
    } catch {
      console.error('bcryptjs not available for legacy hash verification');
      return false;
    }
  }

  throw new Error(`Unknown password hash format: ${storedHash.substring(0, 10)}...`);
}

/**
 * Verify PBKDF2 password hash
 */
async function verifyPbkdf2(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    throw new Error('Invalid PBKDF2 hash format');
  }

  const iterations = parseInt(parts[1], 10);
  const saltHex = parts[2];
  const storedKeyHex = parts[3];

  // Decode salt from hex
  const salt = hexToBuffer(saltHex);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: ALGORITHM },
    false,
    ['deriveBits']
  );

  // Derive key using same parameters
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt,
      iterations,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  // Compare derived key with stored key (constant-time comparison)
  const derivedKeyHex = bufferToHex(new Uint8Array(derivedBits));
  return constantTimeEqual(derivedKeyHex, storedKeyHex);
}

/**
 * Convert Uint8Array to hex string
 */
function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
