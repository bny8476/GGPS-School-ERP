import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: mongoose.Types.ObjectId;
  isActive: boolean;
  status: 'Active' | 'Suspended' | 'Inactive';
  isDeleted: boolean;
  schoolId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  phoneNumber?: string;
  preferredLanguage?: 'en' | 'ta' | 'hi' | 'ml' | 'te' | 'kn' | 'bn' | 'mr' | 'ar' | 'es' | 'fr' | 'de';
  salary?: number;
  designation?: string;
  qualification?: string;
  experienceYears?: number;
  performanceNotes?: string;
  joinDate?: Date;
  assignedClass?: string;
  teachingAssignments?: {
    classId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
  }[];
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name is required'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
      match: [/^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/, 'First name can contain only letters, spaces, hyphens, apostrophes, and periods'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name is required'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      match: [/^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/, 'Last name can contain only letters, spaces, hyphens, apostrophes, and periods'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Inactive'],
      default: 'Active',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
    phoneNumber: {
      type: String,
      trim: true,
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'ta', 'hi', 'ml', 'te', 'kn', 'bn', 'mr', 'ar', 'es', 'fr', 'de'],
      default: 'en',
    },
    salary: {
      type: Number,
    },
    designation: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    experienceYears: {
      type: Number,
    },
    performanceNotes: {
      type: String,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    assignedClass: {
      type: String,
      trim: true,
    },
    teachingAssignments: [
      {
        classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      },
    ],
    passwordResetCode: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ campusId: 1, role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
