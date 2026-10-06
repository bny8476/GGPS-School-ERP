/**
 * GGPS School ERP - Backend Sanitizers and Safety Utilities
 */

/**
 * Escapes characters with special meaning in Regular Expressions.
 * Prevents RegExp injection and ReDoS vulnerabilities in queries.
 */
export function escapeRegex(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strips disallowed characters from person names.
 * Retains letters, spaces, hyphens, apostrophes, and periods (for initials).
 */
export function sanitizeName(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[^a-zA-Z\s'.-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Extracts digits only and trims to 10 digits for standard phone numbers.
 */
export function sanitizePhone(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/\D/g, '').slice(0, 10);
}

/**
 * Normalizes email address.
 */
export function sanitizeEmail(str: string): string {
  if (typeof str !== 'string') return '';
  return str.trim().toLowerCase();
}

/**
 * Cleans regular text input by trimming and collapsing multiple spaces.
 */
export function cleanText(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/\s+/g, ' ').trim();
}
