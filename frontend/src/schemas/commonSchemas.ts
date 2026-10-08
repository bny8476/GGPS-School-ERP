import { z } from "zod";
import {
  NAME_REGEX,
  EMAIL_REGEX,
  PHONE_REGEX,
  TEN_DIGIT_PHONE_REGEX,
  STRONG_PASSWORD_REGEX,
  AMOUNT_REGEX,
} from "@/lib/validationUtils";

// ============================================================================
// 1. REUSABLE PRIMITIVE ZOD SCHEMAS
// ============================================================================

/**
 * Validated person name schema:
 * - Letters, spaces, hyphens, and apostrophes only
 * - Rejects numbers and special characters like @, #, $, %, *
 * - Trims leading/trailing whitespace
 * - Prevents empty or whitespace-only value
 */
export const createNameSchema = (fieldName = "Name", minLen = 2, maxLen = 60) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .min(minLen, `${fieldName} must be at least ${minLen} characters`)
    .max(maxLen, `${fieldName} cannot exceed ${maxLen} characters`)
    .regex(
      NAME_REGEX,
      `${fieldName} can contain only letters, spaces, hyphens, apostrophes, and periods`
    );

/**
 * Standard person name schema (first name, last name, parent name, etc.)
 */
export const nameSchema = createNameSchema("Name");
export const firstNameSchema = createNameSchema("First name", 2, 50);
export const lastNameSchema = createNameSchema("Last name", 1, 50);

/**
 * Standard normalized email schema:
 * - RFC compliant regex
 * - Trims whitespace
 * - Normalizes to lowercase
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email address is required")
  .max(100, "Email cannot exceed 100 characters")
  .regex(EMAIL_REGEX, "Enter a valid email address");

export const optionalEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .optional()
  .refine(
    (val) => !val || EMAIL_REGEX.test(val),
    { message: "Enter a valid email address" }
  );

/**
 * Standard 10-digit phone number schema:
 * - Numeric only
 * - Exactly 10 digits (standard Indian mobile format)
 * - Rejects alphabetic characters and symbols
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(/^\d+$/, "Phone number must contain numbers only")
  .length(10, "Phone number must be exactly 10 digits")
  .regex(
    PHONE_REGEX,
    "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"
  );

export const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || (TEN_DIGIT_PHONE_REGEX.test(val) && PHONE_REGEX.test(val)),
    { message: "Enter a valid 10-digit phone number" }
  );

/**
 * Password schema with configurable strength requirement:
 * - Minimum 8 characters
 * - Uppercase, lowercase, number, special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/\d/, "Password must include at least one number")
  .regex(
    /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/,
    "Password must include at least one special character"
  );

/**
 * Simple login password schema (min 1 char, trimmed on backend)
 */
export const loginPasswordSchema = z
  .string()
  .min(1, "Password is required");

/**
 * Date of Birth schema:
 * - Valid date string
 * - Cannot be in the future
 */
export const dobSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime());
  }, "Please enter a valid date")
  .refine((val) => {
    const d = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return d <= today;
  }, "Date of birth cannot be in the future")
  .refine((val) => {
    const d = new Date(val);
    const today = new Date();
    const ageInYears = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears >= 3;
  }, "Child must be at least 3 years old for school enrollment");

export const optionalDobSchema = z
  .string()
  .optional()
  .refine((val) => {
    if (!val) return true;
    const d = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return !isNaN(d.getTime()) && d <= today;
  }, "Date of birth cannot be in the future")
  .refine((val) => {
    if (!val) return true;
    const d = new Date(val);
    const today = new Date();
    const ageInYears = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears >= 3;
  }, "Child must be at least 3 years old for school enrollment");

/**
 * Numeric amount / fee schema:
 * - Numeric only
 * - Greater than 0
 * - Non-negative
 */
export const amountSchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than 0")
  .max(10000000, "Amount exceeds permitted limit");

export const nonNegativeAmountSchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .min(0, "Amount cannot be negative")
  .max(10000000, "Amount exceeds permitted limit");

/**
 * Percentage schema (0 to 100)
 */
export const percentageSchema = z
  .number({ invalid_type_error: "Percentage must be a number" })
  .min(0, "Percentage cannot be less than 0")
  .max(100, "Percentage cannot exceed 100");

/**
 * Address schema
 */
export const addressSchema = z
  .string()
  .trim()
  .min(5, "Address must be at least 5 characters")
  .max(300, "Address cannot exceed 300 characters");
