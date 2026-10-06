import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmission extends Document {
  applicationNumber: string;
  enquiryReference?: string;
  childFirstName: string;
  childMiddleName?: string;
  childLastName: string;
  childName?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  parentName: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  relationship?: string;
  contactNumber: string;
  parentPhone?: string;
  email?: string;
  parentEmail?: string;
  address?: string;
  gradeAppliedFor: string;
  academicYear?: string;
  preferredContactMethod?: string;
  status: string;
  stage: string;
  interviewDate?: Date;
  interviewNotes?: string;
  admissionScore?: number;
  waitlistPosition?: number;
  notes?: string;
  medicalNotes?: string;
  previousSchool?: string;
  previousClass?: string;
  previousAcademicYear?: string;
  tcAvailable?: boolean;
  source?: string;
  referral?: string;
  documents?: {
    name: string;
    url?: string;
    status?: string;
    remarks?: string;
    verifiedAt?: Date;
    verifiedBy?: string;
  }[];
  feeStatus?: 'Pending' | 'Partial' | 'Paid' | 'Refunded';
  feeAmount?: number;
  feePaid?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  studentId?: mongoose.Types.ObjectId;
  schoolId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema: Schema = new Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    enquiryReference: {
      type: String,
      sparse: true,
      trim: true,
      index: true,
    },
    childFirstName: {
      type: String,
      required: [true, 'Child first name is required'],
      trim: true,
      minlength: [1, 'Child first name is required'],
      maxlength: [50, 'Child first name cannot exceed 50 characters'],
      match: [/^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/, 'Child first name can contain only letters, spaces, hyphens, apostrophes, and periods'],
    },
    childMiddleName: {
      type: String,
      trim: true,
      maxlength: [50, 'Child middle name cannot exceed 50 characters'],
      match: [/^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$|^$/, 'Child middle name can contain only letters, spaces, hyphens, apostrophes, and periods'],
    },
    childLastName: {
      type: String,
      required: [true, 'Child last name is required'],
      trim: true,
      minlength: [1, 'Child last name is required'],
      maxlength: [50, 'Child last name cannot exceed 50 characters'],
      match: [/^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/, 'Child last name can contain only letters, spaces, hyphens, apostrophes, and periods'],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (v: Date) {
          return !v || v <= new Date();
        },
        message: 'Date of birth cannot be in the future',
      },
    },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    parentName: {
      type: String,
      required: [true, "Parent's name is required"],
      trim: true,
      minlength: [2, "Parent's name must be at least 2 characters"],
      maxlength: [80, "Parent's name cannot exceed 80 characters"],
      match: [/^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/, "Parent's name can contain only letters, spaces, hyphens, apostrophes, and periods"],
    },
    fatherName: { type: String, trim: true, maxlength: 80 },
    motherName: { type: String, trim: true, maxlength: 80 },
    guardianName: { type: String, trim: true, maxlength: 80 },
    relationship: { type: String, trim: true },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$|^\d{10}$/, 'Enter a valid 10-digit mobile number'],
    },
    parentPhone: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Enter a valid email address'],
    },
    parentEmail: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true, maxlength: 300 },
    gradeAppliedFor: { type: String, required: true, trim: true },
    academicYear: { type: String, trim: true },
    preferredContactMethod: { type: String, trim: true },
    status: {
      type: String,
      default: 'New',
      index: true,
    },
    stage: {
      type: String,
      default: 'Application',
      index: true,
    },
    interviewDate: { type: Date },
    interviewNotes: { type: String },
    admissionScore: { type: Number },
    waitlistPosition: { type: Number },
    notes: { type: String },
    medicalNotes: { type: String },
    previousSchool: { type: String, trim: true },
    previousClass: { type: String, trim: true },
    previousAcademicYear: { type: String, trim: true },
    tcAvailable: { type: Boolean, default: false },
    source: { type: String, trim: true },
    referral: { type: String, trim: true },
    documents: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        status: { type: String, default: 'Pending' },
        remarks: { type: String, trim: true },
        verifiedAt: { type: Date },
        verifiedBy: { type: String, trim: true },
      },
    ],
    feeStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    feeAmount: { type: Number, default: 25000 },
    feePaid: { type: Number, default: 0 },
    paymentMethod: { type: String, trim: true },
    receiptNumber: { type: String, trim: true },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
  },
  { timestamps: true }
);

AdmissionSchema.index({ stage: 1, createdAt: -1 });
AdmissionSchema.index({ status: 1, createdAt: -1 });
AdmissionSchema.index({ childFirstName: 1, childLastName: 1 });

export default mongoose.models.Admission || mongoose.model<IAdmission>('Admission', AdmissionSchema);
