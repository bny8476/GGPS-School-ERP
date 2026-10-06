import { z } from 'zod';
import {
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  optionalEmailValidator,
  passwordValidator,
  optionalPhoneValidator,
  objectIdValidator,
} from './commonValidators';

export const createUserSchema = z.object({
  body: z.object({
    firstName: firstNameValidator,
    lastName: lastNameValidator,
    email: emailValidator,
    password: passwordValidator,
    roleName: z.string().trim().optional(),
    phoneNumber: optionalPhoneValidator,
    designation: z.string().trim().max(80).optional(),
    qualification: z.string().trim().max(100).optional(),
    experienceYears: z.number().min(0).optional(),
    salary: z.number().min(0).optional(),
    schoolId: objectIdValidator('School ID').optional(),
    campusId: objectIdValidator('Campus ID').optional(),
    linkedChildren: z
      .array(
        z.object({
          studentId: objectIdValidator('Student ID'),
          relationship: z.string().trim().optional(),
          isPrimary: z.boolean().optional(),
          emergencyContact: z.boolean().optional(),
          canPickup: z.boolean().optional(),
          receivesNotifications: z.boolean().optional(),
        })
      )
      .optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: firstNameValidator.optional(),
    lastName: lastNameValidator.optional(),
    email: optionalEmailValidator,
    phoneNumber: optionalPhoneValidator,
    roleName: z.string().trim().optional(),
    designation: z.string().trim().max(80).optional(),
    qualification: z.string().trim().max(100).optional(),
    experienceYears: z.number().min(0).optional(),
    salary: z.number().min(0).optional(),
    status: z.enum(['Active', 'Suspended', 'Inactive']).optional(),
    isActive: z.boolean().optional(),
  }),
});
