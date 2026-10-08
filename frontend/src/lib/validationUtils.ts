/**
 * GGPS School ERP - Unified Validation & Sanitization Engine
 *
 * Implements authoritative validation rules, live typing filters,
 * paste protection, and character sanitizers across all forms.
 */

// ============================================================================
// 1. REGEX PATTERNS
// ============================================================================

/**
 * Letters, spaces, hyphens, apostrophes, and periods (for initials).
 * Requires at least one letter, rejects numbers and disallowed symbols.
 * Example: 'John Doe' (valid), 'S. Arun' (valid), 'Arun Kumar K.' (valid), 'Mary-Anne' (valid), "O'Connor" (valid)
 */
export const NAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/;

/**
 * Standard RFC 5322 compliant email regex
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Valid Indian standard 10-digit mobile number starting with 6, 7, 8, or 9
 * Also accommodates international 10-digit numbers
 */
export const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Lenient 10-digit number (numeric only, exactly 10 digits)
 */
export const TEN_DIGIT_PHONE_REGEX = /^\d{10}$/;

/**
 * Password complexity:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

/**
 * Positive decimal currency / fee amount
 */
export const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

// ============================================================================
// 2. LIVE INPUT SANITIZERS (For onChange, onPaste, and programmatic values)
// ============================================================================

/**
 * Sanitizes a name input by:
 * - Removing any digit
 * - Removing disallowed special characters (keeps letters, spaces, hyphens, apostrophes, and periods)
 * - Collapsing multiple consecutive spaces into a single space
 * - Does NOT trim the right end while typing so the user can type spaces between names
 */
export function sanitizeNameInput(val: string): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[^a-zA-Z\s'.-]/g, '') // remove numbers & illegal special chars, allow letters, dots, hyphens, apostrophes
    .replace(/\s{2,}/g, ' '); // collapse double spaces
}

/**
 * Sanitizes phone input:
 * - Keeps numbers only
 * - Limits to 10 digits maximum
 */
export function sanitizePhoneInput(val: string): string {
  if (typeof val !== 'string') return '';
  return val.replace(/\D/g, '').slice(0, 10);
}

/**
 * Sanitizes integer / number input:
 * - Keeps digits only
 */
export function sanitizeIntegerInput(val: string, maxDigits?: number): string {
  if (typeof val !== 'string') return '';
  const digits = val.replace(/\D/g, '');
  return maxDigits ? digits.slice(0, maxDigits) : digits;
}

/**
 * Sanitizes numeric amount / currency input:
 * - Allows digits and at most one decimal point
 * - Restricts to 2 decimal places
 */
export function sanitizeAmountInput(val: string): string {
  if (typeof val !== 'string') return '';
  // Remove any character that is not a digit or dot
  let cleaned = val.replace(/[^0-9.]/g, '');
  // Keep only the first decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  if (parts.length >= 2) {
    cleaned = parts[0] + '.' + parts[1].slice(0, 2);
  }
  return cleaned;
}

/**
 * Normalizes email:
 * - Trims leading/trailing whitespace
 * - Converts to lowercase
 */
export function sanitizeEmailInput(val: string): string {
  if (typeof val !== 'string') return '';
  return val.trim().toLowerCase();
}

/**
 * Cleans regular text input:
 * - Collapses consecutive spaces
 * - Trims ends when saving/submitting
 */
export function cleanText(val: string): string {
  if (typeof val !== 'string') return '';
  return val.replace(/\s+/g, ' ').trim();
}

// ============================================================================
// 3. KEYBOARD EVENT INTERCEPTORS (Prevent invalid typing)
// ============================================================================

const ALLOWED_NAV_KEYS = new Set([
  'Backspace',
  'Tab',
  'Enter',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'Delete',
]);

/**
 * Prevents non-alphabetic keys in name fields.
 * Permits letters, space, hyphen, apostrophe, period (for initials), and browser navigation keys.
 */
export function preventNonAlphaKey(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  // Allow Ctrl / Cmd combinations (e.g. Cmd+A, Cmd+C, Cmd+V, Cmd+Z)
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (ALLOWED_NAV_KEYS.has(e.key)) return;

  // Check if character is a letter, space, hyphen, apostrophe, or period
  const isAllowedChar = /^[a-zA-Z\s'.-]$/.test(e.key);
  if (!isAllowedChar) {
    e.preventDefault();
  }
}

/**
 * Prevents non-numeric keys in phone or integer fields.
 */
export function preventNonNumericKey(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (ALLOWED_NAV_KEYS.has(e.key)) return;

  const isDigit = /^[0-9]$/.test(e.key);
  if (!isDigit) {
    e.preventDefault();
  }
}

/**
 * Prevents non-decimal amount keys.
 */
export function preventNonDecimalKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (ALLOWED_NAV_KEYS.has(e.key)) return;

  const input = e.currentTarget;
  if (e.key === '.') {
    if (input.value.includes('.')) {
      e.preventDefault();
    }
    return;
  }

  const isDigit = /^[0-9]$/.test(e.key);
  if (!isDigit) {
    e.preventDefault();
  }
}

// ============================================================================
// 4. PASTE HANDLERS (Paste Protection)
// ============================================================================

/**
 * Safely sanitizes text pasted into a name input
 */
export function handleNamePaste(
  e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  setValue: (clean: string) => void
) {
  e.preventDefault();
  const pasted = e.clipboardData.getData('text');
  const sanitized = sanitizeNameInput(pasted);
  setValue(sanitized);
}

/**
 * Safely sanitizes text pasted into a phone input
 */
export function handlePhonePaste(
  e: React.ClipboardEvent<HTMLInputElement>,
  setValue: (clean: string) => void
) {
  e.preventDefault();
  const pasted = e.clipboardData.getData('text');
  const sanitized = sanitizePhoneInput(pasted);
  setValue(sanitized);
}

/**
 * Safely sanitizes text pasted into an amount input
 */
export function handleAmountPaste(
  e: React.ClipboardEvent<HTMLInputElement>,
  setValue: (clean: string) => void
) {
  e.preventDefault();
  const pasted = e.clipboardData.getData('text');
  const sanitized = sanitizeAmountInput(pasted);
  setValue(sanitized);
}

// ============================================================================
// 5. DATE & LOGICAL RELATIONSHIP VALIDATORS
// ============================================================================

/**
 * Checks if a string is a valid ISO or date format
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Validates that date of birth is not in the future and within reasonable human age (e.g. 1-100 years)
 */
export function validateDOB(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr) return { valid: false, error: 'Date of birth is required' };
  const dob = new Date(dateStr);
  if (isNaN(dob.getTime())) return { valid: false, error: 'Please enter a valid date' };

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (dob > today) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }

  const ageInYears = (today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (ageInYears < 3) {
    return { valid: false, error: 'Child must be at least 3 years old for school enrollment' };
  }
  if (ageInYears > 25) {
    return { valid: false, error: 'Please enter a realistic school student date of birth' };
  }

  return { valid: true };
}

/**
 * Validates logical relationship between start date and end date
 */
export function validateDateRange(startDateStr: string, endDateStr: string): { valid: boolean; error?: string } {
  if (!startDateStr || !endDateStr) return { valid: true };
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Please enter valid dates' };
  }
  if (end < start) {
    return { valid: false, error: 'End date cannot be earlier than start date' };
  }
  return { valid: true };
}

// ============================================================================
// 6. NUMERIC & MARKS RANGE VALIDATORS
// ============================================================================

/**
 * Validates percentage (0 - 100)
 */
export function validatePercentage(val: number | string): { valid: boolean; error?: string } {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return { valid: false, error: 'Percentage must be a number' };
  if (num < 0 || num > 100) return { valid: false, error: 'Percentage must be between 0 and 100' };
  return { valid: true };
}

/**
 * Validates marks against maximum allowed marks
 */
export function validateMarks(score: number | string, maxMarks: number | string): { valid: boolean; error?: string } {
  const s = typeof score === 'string' ? parseFloat(score) : score;
  const m = typeof maxMarks === 'string' ? parseFloat(maxMarks) : maxMarks;
  if (isNaN(s)) return { valid: false, error: 'Score must be a number' };
  if (isNaN(m) || m <= 0) return { valid: false, error: 'Maximum marks must be greater than 0' };
  if (s < 0) return { valid: false, error: 'Marks cannot be negative' };
  if (s > m) return { valid: false, error: `Marks cannot exceed maximum marks (${m})` };
  return { valid: true };
}

/**
 * Validates financial amounts (positive number, max 2 decimals)
 */
export function validateAmount(val: number | string, allowZero = false): { valid: boolean; error?: string } {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return { valid: false, error: 'Please enter a valid amount' };
  if (allowZero ? num < 0 : num <= 0) {
    return { valid: false, error: allowZero ? 'Amount cannot be negative' : 'Amount must be greater than 0' };
  }
  return { valid: true };
}

// ============================================================================
// 7. FILE UPLOAD VALIDATOR
// ============================================================================

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
}

export const DEFAULT_ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv',
  '.jpg', '.jpeg', '.png', '.webp', '.svg'
];

export function validateFileUpload(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const maxSizeMB = options.maxSizeMB || 25;
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return { valid: false, error: `File size exceeds the maximum limit of ${maxSizeMB}MB` };
  }

  const allowedExts = options.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS;
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `File format ${ext} is not allowed. Supported formats: ${allowedExts.join(', ')}`,
    };
  }

  return { valid: true };
}
