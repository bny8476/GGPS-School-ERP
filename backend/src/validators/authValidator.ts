import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    roleName: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Valid registered email address is required'),
  }),
});

export const verifyResetCodeSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Valid registered email address is required'),
    code: z.string().min(4, 'Reset code is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Valid registered email address is required'),
    code: z.string().min(4, 'Reset code is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  }),
});

