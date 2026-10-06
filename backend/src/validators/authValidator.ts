import { z } from 'zod';
import {
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
} from './commonValidators';

export const registerSchema = z.object({
  body: z.object({
    firstName: firstNameValidator,
    lastName: lastNameValidator,
    email: emailValidator,
    password: passwordValidator,
    roleName: z.string().trim().optional(),
    phoneNumber: z.string().trim().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailValidator,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidator,
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailValidator,
  }),
});

export const verifyResetCodeSchema = z.object({
  body: z.object({
    email: emailValidator,
    code: z.string().trim().min(4, 'Reset code must be at least 4 digits').max(10),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailValidator,
    code: z.string().trim().min(4, 'Reset code is required'),
    newPassword: passwordValidator,
  }),
});
