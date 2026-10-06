import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  rollNumber?: string;
  admissionDate: Date;
  status: 'Active' | 'Promoted' | 'Transferred' | 'Graduated' | 'Withdrawn';
  promotedFrom?: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Promoted', 'Transferred', 'Graduated', 'Withdrawn'],
      default: 'Active',
      index: true,
    },
    promotedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// A student can only have one active enrollment per academic year
EnrollmentSchema.index({ studentId: 1, academicYearId: 1 }, { unique: true });
EnrollmentSchema.index({ classId: 1, sectionId: 1, academicYearId: 1 });
EnrollmentSchema.index(
  { academicYearId: 1, rollNumber: 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
