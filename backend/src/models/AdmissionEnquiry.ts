import mongoose, { Schema, Document } from 'mongoose';

export type EnquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'QUALIFIED'
  | 'APPLICATION_STARTED'
  | 'CONVERTED'
  | 'CLOSED'
  | 'LOST'
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Qualified'
  | 'Application Started'
  | 'Converted'
  | 'Closed';
export type ContactMethod = 'Phone' | 'WhatsApp' | 'Email';
export type EnquirySource =
  | 'Website'
  | 'Home Page'
  | 'Admission Page'
  | 'Referral'
  | 'Phone'
  | 'Walk-in'
  | 'Direct'
  | 'Social Media'
  | 'Other';
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
    email?: string;
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
      name: {
        type: String,
        required: [true, "Parent's name is required"],
        trim: true,
        minlength: [2, "Parent's name must be at least 2 characters"],
        maxlength: [80, "Parent's name cannot exceed 80 characters"],
        match: [/^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/, "Parent's name can contain only letters, spaces, hyphens, apostrophes, and periods"],
        index: true,
      },
      email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        validate: {
          validator: function (v: string) {
            return !v || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
          },
          message: 'Enter a valid email address',
        },
        index: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[6-9]\d{9}$|^\d{10}$/, 'Enter a valid 10-digit mobile number'],
        index: true,
      },
      relationship: { type: String, trim: true, default: 'Parent' },
    },
    child: {
      name: {
        type: String,
        required: [true, "Child's name is required"],
        trim: true,
        minlength: [1, "Child's name must be at least 1 character"],
        maxlength: [80, "Child's name cannot exceed 80 characters"],
        match: [/^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/, "Child's name can contain only letters, spaces, hyphens, apostrophes, and periods"],
        index: true,
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
    message: { type: String, trim: true, maxlength: 600 },
    preferredVisitDate: { type: Date },
    source: {
      type: String,
      default: 'Website',
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'NEW',
        'CONTACTED',
        'FOLLOW_UP',
        'QUALIFIED',
        'APPLICATION_STARTED',
        'CONVERTED',
        'CLOSED',
        'LOST',
        'New',
        'Contacted',
        'Follow-up',
        'Qualified',
        'Application Started',
        'Converted',
        'Closed',
      ],
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
