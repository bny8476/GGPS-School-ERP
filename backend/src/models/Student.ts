import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  studentId?: string;
  admissionNumber?: string;
  firstName: string;
  lastName: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: Date;
  grade?: string;
  classId?: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  bloodGroup?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  studentPhoto?: string;
  parentId?: mongoose.Types.ObjectId;
  schoolId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred' | 'Withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
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
      match: [/^-$|^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/, 'Last name can contain only letters, spaces, hyphens, apostrophes, and periods'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
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
    grade: {
      type: String,
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    medicalNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Medical notes cannot exceed 500 characters'],
    },
    emergencyContact: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^\d{10}$/.test(v);
        },
        message: 'Emergency contact must be a valid 10-digit number',
      },
    },
    studentPhoto: {
      type: String,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
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
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Graduated', 'Transferred', 'Withdrawn'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

StudentSchema.index({ parentId: 1, status: 1 });
StudentSchema.index({ classId: 1, sectionId: 1, status: 1 });
StudentSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
