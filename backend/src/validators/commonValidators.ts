import { z } from 'zod';
import mongoose from 'mongoose';

export const NAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const TEN_DIGIT_PHONE_REGEX = /^\d{10}$/;

/**
 * Reusable backend name validator:
 * - Letters, spaces, hyphens, apostrophes, and periods (for initials)
 * - Rejects numbers and disallowed special characters (@, #, $, %, etc.)
 * - Trims leading/trailing whitespace
 * - Prevents empty or whitespace-only value
 */
export const createNameValidator = (fieldName = 'Name', minLen = 2, maxLen = 60) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .min(minLen, `${fieldName} must be at least ${minLen} characters`)
    .max(maxLen, `${fieldName} cannot exceed ${maxLen} characters`)
    .regex(NAME_REGEX, `${fieldName} can contain only letters, spaces, hyphens, apostrophes, and periods`);

export const nameValidator = createNameValidator('Name');
export const firstNameValidator = createNameValidator('First name', 2, 50);
export const lastNameValidator = z
  .string()
  .trim()
  .min(1, 'Last name is required')
  .max(50, 'Last name cannot exceed 50 characters')
  .refine(
    (val) => val === '-' || NAME_REGEX.test(val),
    'Last name can contain only letters, spaces, hyphens, apostrophes, and periods'
  );

/**
 * Reusable backend email validator
 */
export const emailValidator = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email address is required')
  .max(100, 'Email cannot exceed 100 characters')
  .regex(EMAIL_REGEX, 'Enter a valid email address');

export const optionalEmailValidator = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === '') return undefined;
    return typeof val === 'string' ? val.trim().toLowerCase() : val;
  },
  z
    .string()
    .refine((val) => !val || EMAIL_REGEX.test(val), {
      message: 'Enter a valid email address',
    })
    .optional()
);

/**
 * Normalizes phone number strings by stripping formatting and standard country code prefixes (+91).
 */
export const normalizePhoneNumber = (val: unknown): unknown => {
  if (typeof val === 'number') val = String(val);
  if (typeof val !== 'string') return val;
  const cleaned = val.trim().replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return cleaned.slice(3);
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.slice(2);
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return cleaned.slice(1);
  }
  if (cleaned.startsWith('+')) {
    return cleaned.slice(1);
  }
  return cleaned;
};

/**
 * Reusable backend phone validator (10 digits numeric)
 */
export const phoneValidator = z.preprocess(
  normalizePhoneNumber,
  z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(PHONE_REGEX, 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9')
);

export const optionalPhoneValidator = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return normalizePhoneNumber(val);
  },
  z
    .string()
    .trim()
    .refine((val) => !val || (TEN_DIGIT_PHONE_REGEX.test(val) && PHONE_REGEX.test(val)), {
      message: 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9',
    })
    .optional()
);

/**
 * Reusable backend password validator (minimum 8 characters)
 */
export const passwordValidator = z
  .string()
  .min(8, 'Password must be at least 6 characters long (minimum 8 characters required)')
  .max(128, 'Password cannot exceed 128 characters');

/**
 * Strong password validator requiring uppercase, lowercase, digit, and special character
 */
export const strongPasswordValidator = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/\d/, 'Password must include at least one number')
  .regex(/[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must include at least one special character');

/**
 * Reusable date of birth validator (cannot be in the future, must be at least 3 years old)
 */
export const dobValidator = z
  .string()
  .or(z.date())
  .refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime());
  }, 'Please enter a valid date')
  .refine((val) => {
    const d = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return d <= today;
  }, 'Date of birth cannot be in the future')
  .refine((val) => {
    const d = new Date(val);
    const today = new Date();
    const ageInYears = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears >= 3;
  }, 'Child must be at least 3 years old for school enrollment');

export const optionalDobValidator = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === '') return undefined;
    return val;
  },
  z
    .string()
    .or(z.date())
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val as string | Date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return !isNaN(d.getTime()) && d <= today;
    }, 'Date of birth cannot be in the future')
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val as string | Date);
      const today = new Date();
      const ageInYears = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return ageInYears >= 3;
    }, 'Child must be at least 3 years old for school enrollment')
);

/**
 * Reusable positive number validator
 */
export const positiveNumberValidator = (fieldName = 'Amount') =>
  z
    .number({ message: `${fieldName} must be a number` })
    .positive(`${fieldName} must be greater than 0`);

/**
 * Reusable non-negative number validator
 */
export const nonNegativeNumberValidator = (fieldName = 'Amount') =>
  z
    .number({ message: `${fieldName} must be a number` })
    .min(0, `${fieldName} cannot be negative`);

/**
 * Reusable percentage validator (0 - 100)
 */
export const percentageValidator = z
  .number({ message: 'Percentage must be a number' })
  .min(0, 'Percentage cannot be less than 0')
  .max(100, 'Percentage cannot exceed 100');

/**
 * MongoDB ObjectId string validator
 */
export const objectIdValidator = (fieldName = 'Identifier') =>
  z
    .string()
    .trim()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: `Invalid ${fieldName} format`,
    });
