import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Normalizes email address by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Hashes a plain-text password using bcrypt.
 * Enforces single hashing strategy across Admin create, self-registration, and password reset.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plain-text candidate password with stored bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Validates password strength policy (min 6 characters).
 */
export function validatePasswordPolicy(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string' || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { valid: true };
}
