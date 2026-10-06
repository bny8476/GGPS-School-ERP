import { z } from 'zod';
import {
  createNameValidator,
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  optionalEmailValidator,
  phoneValidator,
  optionalDobValidator,
  dobValidator,
  objectIdValidator,
} from './commonValidators';

export const createEnquirySchema = z.object({
  body: z.object({
    parentName: createNameValidator("Parent's name", 2, 80),
    phone: phoneValidator,
    email: optionalEmailValidator,
    relationship: z.string().trim().optional(),
    childName: createNameValidator("Child's name", 1, 80).optional(),
    childFirstName: firstNameValidator.optional(),
    childLastName: lastNameValidator.optional(),
    dateOfBirth: optionalDobValidator,
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    classApplied: z.string().trim().min(1, 'Class applied for is required'),
    gradeAppliedFor: z.string().trim().optional(),
    academicYear: z.string().trim().optional(),
    preferredContactMethod: z.enum(['Phone', 'WhatsApp', 'Email']).optional(),
    message: z.string().max(600, 'Message cannot exceed 600 characters').optional(),
    preferredVisitDate: z.string().or(z.date()).optional(),
    source: z.string().trim().optional(),
    notes: z.string().max(1000).optional(),
    followUpDate: z.string().or(z.date()).optional(),
    status: z.string().trim().optional(),
    enquiryDate: z.string().or(z.date()).optional(),
  }).refine((data) => !!(data.childName || data.childFirstName), {
    message: "Child's name is required",
    path: ['childName'],
  }),
});

const nestedAdmissionBody = z.object({
  student: z.object({
    firstName: firstNameValidator,
    lastName: lastNameValidator,
    dateOfBirth: dobValidator,
    gender: z.enum(['Male', 'Female', 'Other'], {
      message: 'Select a valid gender',
    }),
    gradeAppliedFor: z.string().trim().min(1, 'Grade applied for is required'),
  }),
  parent: z.object({
    name: createNameValidator("Parent's name", 2, 80),
    email: emailValidator,
    contactNumber: phoneValidator,
    address: z.string().trim().min(3, 'Address must be at least 3 characters').max(300),
  }),
  academicYear: z.string().trim().optional(),
  documents: z.array(z.any()).optional(),
});

const flatAdmissionBody = z.object({
  childFirstName: firstNameValidator,
  childMiddleName: z.string().trim().optional(),
  childLastName: lastNameValidator,
  dateOfBirth: z.string().or(z.date()).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  gradeAppliedFor: z.string().trim().min(1, 'Grade applied for is required').optional(),
  classApplied: z.string().trim().optional(),
  academicYear: z.string().trim().optional(),
  parentName: createNameValidator("Parent's name", 2, 80),
  fatherName: z.string().trim().optional(),
  motherName: z.string().trim().optional(),
  guardianName: z.string().trim().optional(),
  phone: phoneValidator.optional(),
  contactNumber: phoneValidator.optional(),
  parentPhone: phoneValidator.optional(),
  email: emailValidator.optional(),
  parentEmail: emailValidator.optional(),
  address: z.string().trim().max(300).optional(),
  previousSchool: z.string().trim().optional(),
  previousClass: z.string().trim().optional(),
  previousAcademicYear: z.string().trim().optional(),
  tcAvailable: z.boolean().optional(),
  medicalNotes: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  source: z.string().trim().optional(),
  referral: z.string().trim().optional(),
  documents: z.array(z.any()).optional(),
  stage: z.string().trim().optional(),
  status: z.string().trim().optional(),
  feeAmount: z.number().optional(),
  feePaid: z.number().optional(),
  feeStatus: z.enum(['Pending', 'Partial', 'Paid', 'Refunded']).optional(),
  student: z.any().optional(),
  parent: z.any().optional(),
});

export const createAdmissionSchema = z.object({
  body: z.union([nestedAdmissionBody, flatAdmissionBody]),
});

export const addEnquiryFollowUpSchema = z.object({
  body: z.object({
    date: z.string().or(z.date()),
    time: z.string().trim().optional(),
    type: z.enum(['Phone', 'WhatsApp', 'Email', 'Visit', 'Other']).optional(),
    notes: z.string().trim().min(2, 'Follow-up notes are required').max(1000),
    nextFollowUpDate: z.string().or(z.date()).optional(),
  }),
});

export const addEnquiryNoteSchema = z.object({
  body: z.object({
    text: z.string().trim().min(2, 'Note text is required').max(1000),
  }),
});
