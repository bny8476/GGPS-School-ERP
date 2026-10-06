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

export const DirectCollectSchema = z.object({
  studentName: createNameSchema("Student name", 2, 80),
  grade: z.string().trim().min(1, "Grade is required"),
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  paymentMode: z.enum(["UPI", "Cash", "Card (POS)", "Net Banking", "Cheque"]),
  referenceNo: z.string().trim().optional(),
  notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
});
export type DirectCollectFormValues = z.infer<typeof DirectCollectSchema>;

export const FeeInvoiceCreationSchema = z.object({
  grade: z.string().trim().min(1, "Grade is required"),
  feeType: z.string().trim().min(2, "Fee description must be at least 2 characters").max(100),
  totalAmount: z.coerce.number().positive("Fee amount must be greater than zero"),
  dueDate: z.string().trim().min(1, "Due date is required"),
});
export type FeeInvoiceCreationFormValues = z.infer<typeof FeeInvoiceCreationSchema>;

export const CreateFeeSchema = z.object({
  studentId: z.string().trim().min(1, "Student selection is required"),
  title: z.string().trim().min(2, "Fee title must be at least 2 characters").max(100),
  amount: amountSchema,
  dueDate: z.string().trim().min(1, "Due date is required"),
  category: z.string().trim().optional(),
});
export type CreateFeeFormValues = z.infer<typeof CreateFeeSchema>;

export const ExpenseCreationSchema = z.object({
  description: z.string().trim().min(3, "Description must be at least 3 characters").max(200),
  category: z.string().trim().min(1, "Category is required"),
  amount: z.coerce.number().positive("Expense amount must be greater than zero"),
  date: z.string().trim().min(1, "Date is required"),
});
export type ExpenseCreationFormValues = z.infer<typeof ExpenseCreationSchema>;

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

export const FeeStructureSchema = z.object({
  grade: z.string().trim().min(1, "Grade is required"),
  tuitionFee: z.coerce.number().min(0, "Tuition fee cannot be negative"),
  developmentFee: z.coerce.number().min(0, "Development fee cannot be negative"),
  labFee: z.coerce.number().min(0, "Lab fee cannot be negative"),
  sportsFee: z.coerce.number().min(0, "Sports fee cannot be negative"),
  examFee: z.coerce.number().min(0, "Exam fee cannot be negative"),
  termSchedule: z.string().trim().min(1, "Installment schedule is required"),
}).refine(data => {
  const total = Number(data.tuitionFee || 0) + Number(data.developmentFee || 0) + Number(data.labFee || 0) + Number(data.sportsFee || 0) + Number(data.examFee || 0);
  return total > 0;
}, {
  message: "Total tariff structure must be greater than zero",
  path: ["tuitionFee"],
});
export type FeeStructureFormValues = z.infer<typeof FeeStructureSchema>;

// ============================================================================
// 6. ACADEMICS, HOMEWORK, EXAMS & MARKS
// ============================================================================

export const ClassCreationSchema = z.object({
  name: z.string().trim().min(2, "Class name must be at least 2 characters").max(40, "Class name cannot exceed 40 characters"),
  subtitle: z.string().trim().max(100, "Subtitle cannot exceed 100 characters").optional(),
  classTeacher: z.string().trim().max(80, "Teacher name cannot exceed 80 characters").optional(),
  badgeColor: z.string().trim().optional(),
});
export type ClassCreationFormValues = z.infer<typeof ClassCreationSchema>;

export const SectionCreationSchema = z.object({
  letter: z.string().trim().min(1, "Section letter is required").max(3, "Section letter cannot exceed 3 characters").regex(/^[A-Za-z0-9]+$/, "Section must contain only letters or numbers"),
});
export type SectionCreationFormValues = z.infer<typeof SectionCreationSchema>;

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
  roleName: z.string().trim().min(1, "Role is required"),
  phoneNumber: optionalPhoneSchema,
  designation: z.string().trim().max(80).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type UserCreationFormValues = z.infer<typeof UserCreationSchema>;

export const UserEditSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  roleName: z.string().trim().min(1, "Role is required"),
  phoneNumber: optionalPhoneSchema,
  designation: z.string().trim().max(80).optional(),
});
export type UserEditFormValues = z.infer<typeof UserEditSchema>;

export const CustomRoleSchema = z.object({
  roleName: createNameSchema("Role title", 2, 50),
});
export type CustomRoleFormValues = z.infer<typeof CustomRoleSchema>;

// ============================================================================
// 8. LEAVE MANAGEMENT SCHEMA
// ============================================================================

export const LeaveRequestSchema = z
  .object({
    userId: z.string().trim().min(1, "Please select a faculty or staff member"),
    leaveType: z.enum(["Casual", "Sick", "Earned", "Maternity", "Official Duty", "Other"]),
    sessionType: z.enum(["Full Day", "Half Day (Forenoon)", "Half Day (Afternoon)"]),
    startDate: z.string().trim().min(1, "Start date is required"),
    endDate: z.string().trim().min(1, "End date is required"),
    reason: z
      .string()
      .trim()
      .min(3, "Reason for absence must be at least 3 characters")
      .max(500, "Reason cannot exceed 500 characters"),
  })
  .refine(
    (data) => {
      if (!data.startDate) return true;
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return data.startDate >= today;
    },
    {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date cannot be earlier than start date",
      path: ["endDate"],
    }
  );
export type LeaveRequestFormValues = z.infer<typeof LeaveRequestSchema>;

// ============================================================================
// 9. TEACHER PROFILE & CREATION SCHEMA
// ============================================================================

export const TeacherCreationSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  phoneNumber: optionalPhoneSchema,
  assignedClass: z.string().trim().min(1, "Please select an assigned teaching class"),
  designation: z.string().trim().max(80).optional(),
  qualification: z.string().trim().max(100).optional(),
  experienceYears: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 50), {
      message: "Experience must be between 0 and 50 years",
    }),
  salary: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Salary must be a positive number",
    }),
});
export type TeacherCreationFormValues = z.infer<typeof TeacherCreationSchema>;

// ============================================================================
// 10. SUBJECT SETUP SCHEMA
// ============================================================================

export const SubjectCreationSchema = z.object({
  name: z.string().trim().min(2, "Subject name must be at least 2 characters").max(80),
  description: z.string().trim().max(300).optional(),
  colorCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code")
    .optional(),
});
export type SubjectCreationFormValues = z.infer<typeof SubjectCreationSchema>;

// ============================================================================
// 11. SETTINGS & PROFILE SCHEMAS
// ============================================================================

export const InstitutionalSettingsSchema = z.object({
  schoolName: z.string().trim().min(2, "School name must be at least 2 characters").max(100),
  schoolTagline: z.string().trim().max(150).optional(),
  schoolEmail: emailSchema,
  schoolPhone: phoneSchema,
  schoolAddress: z.string().trim().min(5, "Address must be at least 5 characters").max(250),
  academicYear: z.string().trim().min(4, "Academic year is required"),
  currency: z.string().trim().min(1, "Currency is required"),
  timezone: z.string().trim().min(1, "Timezone is required"),
  language: z.string().trim().min(1, "Language is required"),
  enableSMS: z.boolean().optional(),
  enableEmailNotifications: z.boolean().optional(),
});
export type InstitutionalSettingsFormValues = z.infer<typeof InstitutionalSettingsSchema>;

export const ProfileUpdateSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  phoneNumber: optionalPhoneSchema,
});
export type ProfileUpdateFormValues = z.infer<typeof ProfileUpdateSchema>;

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});
export type PasswordChangeFormValues = z.infer<typeof PasswordChangeSchema>;

// ============================================================================
// 12. PARENT & BROADCAST SCHEMAS
// ============================================================================

export const ParentRegistrationSchema = z.object({
  fatherName: z.string().trim().optional(),
  fatherOccupation: z.string().trim().max(80).optional(),
  fatherContact: optionalPhoneSchema,
  motherName: z.string().trim().optional(),
  motherOccupation: z.string().trim().max(80).optional(),
  motherContact: optionalPhoneSchema,
  guardianName: z.string().trim().optional(),
  guardianContact: optionalPhoneSchema,
  primaryEmail: emailSchema,
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(250),
  whatsappNumber: optionalPhoneSchema,
}).refine(data => Boolean(data.fatherName?.trim() || data.motherName?.trim() || data.guardianName?.trim()), {
  message: "At least one parent or guardian name is required",
  path: ["fatherName"],
});
export type ParentRegistrationFormValues = z.infer<typeof ParentRegistrationSchema>;

export const BroadcastMessageSchema = z.object({
  channel: z.enum(["WhatsApp", "SMS", "Email"]),
  targetGroup: z.string().trim().min(1, "Target audience group is required"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(120),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(1000),
});
export type BroadcastMessageFormValues = z.infer<typeof BroadcastMessageSchema>;

export const LinkStudentSchema = z.object({
  studentId: z.string().trim().min(1, "Please select a student"),
  relationship: z.string().trim().min(1, "Relationship is required"),
});
export type LinkStudentFormValues = z.infer<typeof LinkStudentSchema>;

// ============================================================================
// 13. NOTICES, CIRCULARS & EVENTS SCHEMAS
// ============================================================================

export const NoticeCreationSchema = z.object({
  title: z.string().trim().min(3, "Circular title must be at least 3 characters").max(140, "Title cannot exceed 140 characters"),
  category: z.enum(['Curricular', 'Events', 'Health & Safety', 'Logistics', 'Administrative']),
  audience: z.string().trim().min(1, "Target audience is required"),
  cohort: z.string().trim().min(1, "Preschool cohort scope is required"),
  isUrgent: z.boolean().optional(),
  message: z.string().trim().min(10, "Notice content must be at least 10 characters").max(2000, "Notice content cannot exceed 2000 characters"),
});
export type NoticeCreationFormValues = z.infer<typeof NoticeCreationSchema>;

export const EventCreationSchema = z.object({
  title: z.string().trim().min(3, "Event title must be at least 3 characters").max(100, "Event title cannot exceed 100 characters"),
  type: z.string().trim().min(1, "Event type is required"),
  date: z.string().trim().min(1, "Event date is required"),
  time: z.string().trim().min(1, "Timing is required").max(60),
  location: z.string().trim().min(2, "Location must be at least 2 characters").max(100),
  status: z.enum(["Upcoming", "Completed"]),
  audience: z.string().trim().min(1, "Target audience is required"),
  image: z.string().min(1, "Cover image is required"),
  description: z.string().trim().max(1000).optional(),
});
export type EventCreationFormValues = z.infer<typeof EventCreationSchema>;

// ============================================================================
// 14. ASSESSMENTS, EXAMINATIONS & CLASSROOM SCHEMAS
// ============================================================================

export const AssessmentEntrySchema = z.object({
  studentId: z.string().trim().min(1, "Please select a student"),
  term: z.string().trim().min(1, "Academic term is required"),
  teacherComments: z.string().trim().max(1000).optional(),
});
export type AssessmentEntryFormValues = z.infer<typeof AssessmentEntrySchema>;

export const OnlineExamCreationSchema = z.object({
  title: z.string().trim().min(3, "Exam title must be at least 3 characters").max(120),
  duration: z.string().trim().min(1, "Duration is required"),
  totalQuestions: z.coerce.number().min(1, "At least 1 question is required").max(200, "Maximum 200 questions"),
  passingScore: z.string().trim().min(1, "Passing score is required"),
  status: z.enum(["Active", "Scheduled", "Completed"]),
});
export type OnlineExamCreationFormValues = z.infer<typeof OnlineExamCreationSchema>;

export const ClassroomMaterialSchema = z.object({
  title: z.string().trim().min(2, "Material title must be at least 2 characters").max(120),
  subject: z.string().trim().min(1, "Subject is required"),
  classId: z.string().trim().optional(),
  fileUrl: z.string().trim().min(1, "File URL or attachment is required"),
  fileType: z.string().trim().min(1, "File type is required"),
  description: z.string().trim().max(500).optional(),
});
export type ClassroomMaterialFormValues = z.infer<typeof ClassroomMaterialSchema>;

export const ClassroomQuestionSchema = z.object({
  questionText: z.string().trim().min(5, "Question prompt must be at least 5 characters").max(1000),
  subject: z.string().trim().min(1, "Subject is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  marks: z.coerce.number().min(1, "Marks must be at least 1").max(50, "Marks cannot exceed 50"),
  correctAnswer: z.string().trim().min(1, "Correct answer is required"),
});
export type ClassroomQuestionFormValues = z.infer<typeof ClassroomQuestionSchema>;


