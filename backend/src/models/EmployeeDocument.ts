import mongoose, { Schema, Document } from 'mongoose';

export type EmployeeDocCategory =
  | 'ID Proof'
  | 'Qualification Certificate'
  | 'Experience Certificate'
  | 'Joining Documents'
  | 'Address Proof'
  | 'Photo'
  | 'Contract'
  | 'Other Documents';

export type EmployeeDocVerificationStatus =
  | 'Pending'
  | 'Verified'
  | 'Rejected'
  | 'Replacement Required';

export interface IEmployeeDocument extends Document {
  employeeId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fileRecordId?: mongoose.Types.ObjectId;
  title: string;
  category: EmployeeDocCategory;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  documentUrl: string;
  verificationStatus: EmployeeDocVerificationStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeDocumentSchema: Schema = new Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FileRecord',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'ID Proof',
        'Qualification Certificate',
        'Experience Certificate',
        'Joining Documents',
        'Address Proof',
        'Photo',
        'Contract',
        'Other Documents',
      ],
      required: true,
      index: true,
    },
    fileName: { type: String, trim: true },
    fileSize: { type: Number },
    mimeType: { type: String, trim: true },
    documentUrl: {
      type: String,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Replacement Required'],
      default: 'Pending',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

EmployeeDocumentSchema.index({ userId: 1, category: 1 });

export default mongoose.models.EmployeeDocument || mongoose.model<IEmployeeDocument>('EmployeeDocument', EmployeeDocumentSchema);
