import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentParent extends Document {
  studentId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  relationship: 'Father' | 'Mother' | 'Guardian' | 'Other';
  relationshipType?: string;
  isPrimary: boolean;
  canPickup: boolean;
  receivesNotifications: boolean;
  emergencyContact: boolean;
  isEmergencyContact?: boolean;
  status: 'active' | 'inactive';
  schoolId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentParentSchema: Schema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true,
    },
    relationship: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian', 'Other'],
      default: 'Guardian',
      required: true,
    },
    relationshipType: {
      type: String,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    canPickup: {
      type: Boolean,
      default: true,
    },
    receivesNotifications: {
      type: Boolean,
      default: true,
    },
    emergencyContact: {
      type: Boolean,
      default: true,
    },
    isEmergencyContact: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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

// Prevent duplicate junction links between same student and parent
StudentParentSchema.index({ studentId: 1, parentId: 1 }, { unique: true });
StudentParentSchema.index({ parentId: 1, status: 1 });

export default mongoose.models.StudentParent || mongoose.model<IStudentParent>('StudentParent', StudentParentSchema);
