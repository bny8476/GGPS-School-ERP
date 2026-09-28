import mongoose, { Schema, Document } from 'mongoose';

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'FOLLOW_UP' | 'CONVERTED' | 'CLOSED' | 'LOST';
export type ContactMethod = 'Phone' | 'WhatsApp' | 'Email';
export type EnquirySource = 'Website' | 'Home Page' | 'Admission Page' | 'Referral' | 'Other';
export type FollowUpType = 'Phone' | 'WhatsApp' | 'Email' | 'Visit' | 'Other';

export interface IFollowUp {
  _id?: mongoose.Types.ObjectId;
  date: Date;
  time?: string;
  type: FollowUpType;
  notes: string;
  createdBy?: {
    id?: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
  };
  createdAt: Date;
}

export interface IEnquiryNote {
  _id?: mongoose.Types.ObjectId;
  text: string;
  createdBy?: {
    id?: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
  };
  createdAt: Date;
}

export interface IAdmissionEnquiry extends Document {
  enquiryId: string;
  schoolId?: mongoose.Types.ObjectId;
  academicYearId?: mongoose.Types.ObjectId;
  academicYear: string;

  parent: {
    name: string;
    email: string;
    phone: string;
    relationship?: string;
  };

  child: {
    name: string;
    dateOfBirth?: Date;
    classApplied: string;
    gender?: 'Male' | 'Female' | 'Other';
  };

  preferredContactMethod: ContactMethod;
  message?: string;
  preferredVisitDate?: Date;
  source: EnquirySource;
  status: EnquiryStatus;

  assignedTo?: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role?: string;
  };

  followUps: IFollowUp[];
  notes: IEnquiryNote[];

  conversion?: {
    applicationId?: mongoose.Types.ObjectId;
    applicationNumber?: string;
    convertedAt?: Date;
    convertedBy?: {
      id: mongoose.Types.ObjectId;
      name: string;
    };
  };

  lastContactAt?: Date;
  lastContactMethod?: string;
  nextFollowUpDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema(
  {
    date: { type: Date, required: true },
    time: { type: String, trim: true },
    type: {
      type: String,
      enum: ['Phone', 'WhatsApp', 'Email', 'Visit', 'Other'],
      default: 'Phone',
    },
    notes: { type: String, required: true, trim: true },
    createdBy: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, trim: true },
      email: { type: String, trim: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const EnquiryNoteSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    createdBy: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, trim: true },
      email: { type: String, trim: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AdmissionEnquirySchema: Schema = new Schema(
  {
    enquiryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    academicYearId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      default: '2026–2027',
      index: true,
    },
    parent: {
      name: { type: String, required: true, trim: true, index: true },
      email: { type: String, required: true, trim: true, lowercase: true, index: true },
      phone: { type: String, required: true, trim: true, index: true },
      relationship: { type: String, trim: true, default: 'Parent' },
    },
    child: {
      name: { type: String, required: true, trim: true, index: true },
      dateOfBirth: { type: Date },
      classApplied: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    },
    preferredContactMethod: {
      type: String,
      enum: ['Phone', 'WhatsApp', 'Email'],
      default: 'Phone',
    },
    message: { type: String, trim: true },
    preferredVisitDate: { type: Date },
    source: {
      type: String,
      enum: ['Website', 'Home Page', 'Admission Page', 'Referral', 'Other'],
      default: 'Website',
      index: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED', 'LOST'],
      default: 'NEW',
      index: true,
    },
    assignedTo: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      role: { type: String, trim: true },
    },
    followUps: [FollowUpSchema],
    notes: [EnquiryNoteSchema],
    conversion: {
      applicationId: { type: Schema.Types.ObjectId, ref: 'Admission' },
      applicationNumber: { type: String, trim: true },
      convertedAt: { type: Date },
      convertedBy: {
        id: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, trim: true },
      },
    },
    lastContactAt: { type: Date },
    lastContactMethod: { type: String, trim: true },
    nextFollowUpDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for lightning-fast duplicate checking and queries
AdmissionEnquirySchema.index({ 'parent.phone': 1, 'child.name': 1, academicYear: 1 });
AdmissionEnquirySchema.index({ 'parent.email': 1, 'child.name': 1, academicYear: 1 });
AdmissionEnquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.AdmissionEnquiry ||
  mongoose.model<IAdmissionEnquiry>('AdmissionEnquiry', AdmissionEnquirySchema);
