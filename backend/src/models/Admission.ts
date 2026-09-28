import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmission extends Document {
  applicationNumber: string;
  enquiryReference?: string;
  childFirstName: string;
  childLastName: string;
  childName?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  parentName: string;
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
  documents?: { name: string; url: string }[];
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
    childFirstName: { type: String, required: true, trim: true },
    childLastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    parentName: { type: String, required: true, trim: true },
    relationship: { type: String, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    parentPhone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    parentEmail: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
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
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
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
