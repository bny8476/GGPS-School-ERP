import { z } from "zod";
import {
  createNameSchema,
  firstNameSchema,
  lastNameSchema,
  nameSchema,
  emailSchema,
  optionalEmailSchema,
  phoneSchema,
  optionalPhoneSchema,
  passwordSchema,
  loginPasswordSchema,
  dobSchema,
  optionalDobSchema,
  amountSchema,
  nonNegativeAmountSchema,
  percentageSchema,
  addressSchema,
} from "./commonSchemas";

export * from "./commonSchemas";

// ============================================================================
// 1. AUTHENTICATION SCHEMAS
// ============================================================================

export const LoginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
  role: z.enum(["Admin", "Teacher", "Parent", "SuperAdmin"]).optional(),
  rememberMe: z.boolean().optional(),
});
export type LoginFormValues = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export const VerifyResetCodeSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .min(4, "Reset code must be at least 4 digits")
    .max(10, "Reset code is invalid"),
});
export type VerifyResetCodeFormValues = z.infer<typeof VerifyResetCodeSchema>;

export const ResetPasswordSchema = z
  .object({
    email: emailSchema,
    code: z.string().trim().min(4, "Reset code is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;

// ============================================================================
// 2. STUDENT ENROLLMENT & PROFILE SCHEMA
// ============================================================================

export const StudentSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  admissionNumber: z.string().trim().min(3, "Admission number is required"),
  grade: z.string().trim().min(1, "Grade / Class is required"),
  section: z.string().trim().min(1, "Section is required"),
  rollNumber: z.string().trim().optional(),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Select a valid gender" }),
  }),
  dateOfBirth: optionalDobSchema,
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""])
    .optional(),
  fatherName: createNameSchema("Father's name", 2, 60),
  motherName: createNameSchema("Mother's name", 2, 60),
  primaryContact: phoneSchema,
  address: addressSchema,
  medicalNotes: z.string().max(500, "Medical notes cannot exceed 500 characters").optional(),
});
export type StudentFormValues = z.infer<typeof StudentSchema>;

// ============================================================================
// 3. ADMISSION & ENQUIRY SCHEMAS
// ============================================================================

export const AdmissionEnquirySchema = z.object({
  parentName: createNameSchema("Parent/Guardian name", 2, 80),
  email: emailSchema,
  phone: phoneSchema,
  relationship: z.enum(["Father", "Mother", "Guardian", "Other"], {
    errorMap: () => ({ message: "Select a valid relationship" }),
  }),
  childName: createNameSchema("Child name", 2, 80),
  dateOfBirth: optionalDobSchema,
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Select child gender" }),
  }),
  classApplied: z.enum(["PreKG", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"], {
    errorMap: () => ({ message: "Please select the class applying for" }),
  }),
  academicYear: z.string().trim().min(1, "Academic year is required"),
  preferredContactMethod: z.enum(["Phone", "WhatsApp", "Email"]),
  message: z.string().max(600, "Message cannot exceed 600 characters").optional(),
  preferredVisitDate: z.string().optional(),
  source: z.enum(["Website", "Home Page", "Admission Page", "Referral", "Other"]).optional(),
});
export type AdmissionEnquiryFormValues = z.infer<typeof AdmissionEnquirySchema>;

export const FormalAdmissionSchema = z.object({
  childFirstName: firstNameSchema,
  childLastName: lastNameSchema,
  dateOfBirth: dobSchema,
  gender: z.enum(["Male", "Female", "Other"]),
  gradeAppliedFor: z.string().trim().min(1, "Class applied for is required"),
  parentName: createNameSchema("Parent/Guardian name", 2, 80),
  email: emailSchema,
  contactNumber: phoneSchema,
  address: addressSchema,
});
export type FormalAdmissionFormValues = z.infer<typeof FormalAdmissionSchema>;

// Backward compatibility alias
export const AdmissionApplicationSchema = z.object({
  studentName: createNameSchema("Student name", 2, 80),
  applyingForGrade: z.string().trim().min(1, "Grade is required"),
  parentName: createNameSchema("Parent name", 2, 80),
  email: emailSchema,
  phone: phoneSchema,
  previousSchool: z.string().optional(),
  dateOfBirth: optionalDobSchema,
  notes: z.string().optional(),
});
export type AdmissionApplicationFormValues = z.infer<typeof AdmissionApplicationSchema>;

// ============================================================================
// 4. ATTENDANCE MARKING SCHEMA
// ============================================================================

export const AttendanceRecordSchema = z.object({
  studentId: z.string().trim().min(1, "Student ID is required"),
  status: z.enum(["Present", "Absent", "Late", "Excused", "Half-Day"]),
  remarks: z.string().max(250, "Remarks cannot exceed 250 characters").optional(),
});

export const BulkAttendanceSchema = z.object({
  date: z.string().trim().min(1, "Date is required"),
  classId: z.string().trim().min(1, "Class is required"),
  sectionId: z.string().trim().min(1, "Section is required"),
  records: z.array(AttendanceRecordSchema).min(1, "At least one attendance record is required"),
});
export type BulkAttendanceFormValues = z.infer<typeof BulkAttendanceSchema>;

// ============================================================================
// 5. FINANCE & FEES SCHEMAS
// ============================================================================

export const FeeCollectionSchema = z.object({
  studentId: z.string().trim().min(1, "Student is required"),
  invoiceId: z.string().optional(),
  amount: amountSchema,
  paymentMethod: z.enum(["Cash", "Online", "Cheque", "UPI", "Bank Transfer"]),
  transactionRef: z.string().trim().optional(),
  remarks: z.string().max(300, "Remarks cannot exceed 300 characters").optional(),
  date: z.string().trim().min(1, "Date is required"),
});
export type FeeCollectionFormValues = z.infer<typeof FeeCollectionSchema>;

export const CreateFeeSchema = z.object({
  studentId: z.string().trim().min(1, "Student selection is required"),
  title: z.string().trim().min(2, "Fee title must be at least 2 characters").max(100),
  amount: amountSchema,
  dueDate: z.string().trim().min(1, "Due date is required"),
  category: z.string().trim().optional(),
});
export type CreateFeeFormValues = z.infer<typeof CreateFeeSchema>;

export const ExpenseSchema = z.object({
  title: z.string().trim().min(2, "Expense title must be at least 2 characters").max(100),
  category: z.string().trim().min(1, "Category is required"),
  amount: amountSchema,
  date: z.string().trim().min(1, "Date is required"),
  description: z.string().max(400, "Description cannot exceed 400 characters").optional(),
});
export type ExpenseFormValues = z.infer<typeof ExpenseSchema>;

export const ScholarshipSchema = z.object({
  studentName: createNameSchema("Student name", 2, 80),
  admissionNo: z.string().trim().optional(),
  grade: z.string().trim().min(1, "Grade is required"),
  category: z.string().trim().min(1, "Scholarship category is required"),
  discountPercentage: percentageSchema,
});
export type ScholarshipFormValues = z.infer<typeof ScholarshipSchema>;

// ============================================================================
// 6. ACADEMICS, HOMEWORK, EXAMS & MARKS
// ============================================================================

export const HomeworkSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  subject: z.string().trim().min(2, "Subject is required"),
  classId: z.string().trim().min(1, "Class is required"),
  sectionId: z.string().trim().min(1, "Section is required"),
  description: z.string().trim().min(5, "Description must be at least 5 characters").max(1000),
  dueDate: z.string().trim().min(1, "Due date is required"),
  attachmentUrl: z.string().url("Invalid attachment URL").optional().or(z.literal("")),
});
export type HomeworkFormValues = z.infer<typeof HomeworkSchema>;

export const DailyDiarySchema = z.object({
  classId: z.string().trim().min(1, "Class is required"),
  sectionId: z.string().trim().min(1, "Section is required"),
  date: z.string().trim().min(1, "Date is required"),
  todayLearning: z.string().trim().min(5, "Learning summary is required").max(1000),
  todayActivity: z.string().max(500).optional(),
  specialNote: z.string().max(500).optional(),
});
export type DailyDiaryFormValues = z.infer<typeof DailyDiarySchema>;

export const ExamScheduleSchema = z.object({
  title: z.string().trim().min(3, "Exam title must be at least 3 characters").max(120),
  subject: z.string().trim().min(2, "Subject is required"),
  category: z.enum(["TERM_SUMMATIVE", "PERIODIC_DIAGNOSTIC", "ORAL_PRACTICAL"]),
  date: z.string().trim().min(1, "Exam date is required"),
  maxWritten: nonNegativeAmountSchema,
  maxOral: nonNegativeAmountSchema,
  description: z.string().max(500).optional(),
}).refine((data) => (data.maxWritten + data.maxOral) > 0, {
  message: "Total maximum marks must be greater than zero",
  path: ["maxWritten"],
});
export type ExamScheduleFormValues = z.infer<typeof ExamScheduleSchema>;

// ============================================================================
// 7. USER & STAFF PROVISIONING SCHEMA
// ============================================================================

export const UserCreationSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm password"),
  roleName: z.enum(["Admin", "Teacher", "Parent", "Accountant", "SuperAdmin", "Principal"]),
  phoneNumber: optionalPhoneSchema,
  designation: z.string().trim().max(80).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type UserCreationFormValues = z.infer<typeof UserCreationSchema>;
