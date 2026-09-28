import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.string().or(z.date()).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    admissionNumber: z.string().optional(),
    studentId: z.string().regex(/^GGPS[0-9]{4}[A-Z]+[0-9]{3,}$/, 'Student ID must follow format GGPS{YEAR}{CLASS}{SEQUENCE}').optional(),
    rollNumber: z.string().optional(),
    classId: z.string().optional(),
    sectionId: z.string().optional(),
    academicYearId: z.string().optional(),
    academicYear: z.string().optional(),
    className: z.string().optional(),
    sectionName: z.string().optional(),
    grade: z.string().optional(),
    bloodGroup: z.string().optional(),
    medicalNotes: z.string().optional(),
    emergencyContact: z.string().optional(),
    parentId: z.string().optional(),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    studentId: z.string().regex(/^GGPS[0-9]{4}[A-Z]+[0-9]{3,}$/, 'Student ID must follow format GGPS{YEAR}{CLASS}{SEQUENCE}').optional(),
    dob: z.string().or(z.date()).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    classId: z.string().optional(),
    sectionId: z.string().optional(),
    parentId: z.string().optional(),
    rollNumber: z.string().optional(),
  }),
});
