import { z } from 'zod';
import {
  firstNameValidator,
  lastNameValidator,
  optionalDobValidator,
  optionalPhoneValidator,
  createNameValidator,
} from './commonValidators';

export const createStudentSchema = z.object({
  body: z.object({
    firstName: firstNameValidator,
    lastName: lastNameValidator,
    dob: optionalDobValidator,
    gender: z.enum(['Male', 'Female', 'Other'], {
      message: 'Gender must be Male, Female, or Other',
    }).optional(),
    admissionNumber: z.string().trim().optional(),
    studentId: z
      .string()
      .trim()
      .regex(/^GGPS[0-9]{4}[A-Z0-9]+[0-9]{3,}$/, 'Student ID must follow format GGPS{YEAR}{CLASS}{SEQUENCE}')
      .optional(),
    rollNumber: z.string().trim().optional(),
    classId: z.string().trim().optional(),
    sectionId: z.string().trim().optional(),
    academicYearId: z.string().trim().optional(),
    academicYear: z.string().trim().optional(),
    className: z.string().trim().optional(),
    sectionName: z.string().trim().optional(),
    grade: z.string().trim().optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).optional(),
    medicalNotes: z.string().max(500, 'Medical notes cannot exceed 500 characters').optional(),
    emergencyContact: optionalPhoneValidator,
    parentId: z.string().trim().optional(),
    parentName: createNameValidator("Parent's name", 2, 80).optional(),
    phone: optionalPhoneValidator,
    address: z.string().trim().max(300).optional(),
    authorizedPickupPerson: createNameValidator('Pickup person', 2, 80).optional(),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    firstName: firstNameValidator.optional(),
    lastName: lastNameValidator.optional(),
    studentId: z
      .string()
      .trim()
      .regex(/^GGPS[0-9]{4}[A-Z0-9]+[0-9]{3,}$/, 'Student ID must follow format GGPS{YEAR}{CLASS}{SEQUENCE}')
      .optional(),
    dob: optionalDobValidator,
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    classId: z.string().trim().optional(),
    sectionId: z.string().trim().optional(),
    parentId: z.string().trim().optional(),
    rollNumber: z.string().trim().optional(),
    emergencyContact: optionalPhoneValidator,
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).optional(),
    medicalNotes: z.string().max(500).optional(),
  }),
});
