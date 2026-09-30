import mongoose, { Schema, Document } from 'mongoose';

export interface IFileVersion {
  storedName: string;
  storageKey: string;
  size: number;
  mimeType: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  changeNote?: string;
}

export interface IFileRecord extends Document {
  schoolId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  originalName: string;
  storedName: string;
  mimeType: string;
  extension: string;
  size: number;
  storageKey: string;
  url: string;
  category: string;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  visibility: 'public' | 'private' | 'restricted';
  status: 'active' | 'archived' | 'deleted';
  version: number;
  versionHistory?: IFileVersion[];
  checksum?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected' | 'Replacement Required';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const FileVersionSchema = new Schema(
  {
    storedName: { type: String, required: true },
    storageKey: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    changeNote: { type: String },
  },
  { _id: false }
);

const FileRecordSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', index: true },
    campusId: { type: Schema.Types.ObjectId, ref: 'Campus', index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true, trim: true },
    storedName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    extension: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    storageKey: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      default: 'general',
      trim: true,
      index: true,
    },
    entityType: { type: String, trim: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'private',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
      index: true,
    },
    version: { type: Number, default: 1 },
    versionHistory: [FileVersionSchema],
    checksum: { type: String },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Replacement Required'],
      default: 'Pending',
      index: true,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

FileRecordSchema.index({ category: 1, entityType: 1, entityId: 1 });
FileRecordSchema.index({ originalName: 'text' });

export default mongoose.models.FileRecord || mongoose.model<IFileRecord>('FileRecord', FileRecordSchema);
