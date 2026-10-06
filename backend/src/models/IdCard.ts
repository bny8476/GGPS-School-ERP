import mongoose, { Schema, Document } from 'mongoose';

export interface IIdCardFields {
  showBloodGroup: boolean;
  showParentName: boolean;
  showParentPhone: boolean;
  showAddress: boolean;
  showEmergencyContact: boolean;
  showQRCode: boolean;
  showBarcode: boolean;
  house?: string;
  notes?: string;
}

export interface IIdCardBranding {
  logoUrl?: string;
  schoolName: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryColor?: string;
  secondaryColor?: string;
  principalSignatureUrl?: string;
}

export interface IIdCard extends Document {
  schoolId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYear: string;
  cardNumber: string;
  templateId: 'modern-blue' | 'classic-white' | 'premium-school' | 'minimal' | 'custom';
  validFrom: Date;
  validTill: Date;
  status: 'draft' | 'generated' | 'active' | 'expired' | 'revoked';
  photoUrl?: string;
  fields: IIdCardFields;
  verificationToken: string;
  barcodeValue: string;
  pdfUrl?: string;
  revocationReason?: string;
  revokedAt?: Date;
  revokedBy?: mongoose.Types.ObjectId;
  version: number;
  schoolBranding: IIdCardBranding;
  generatedAt: Date;
  generatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IdCardSchema: Schema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
    campusId: {
      type: Schema.Types.ObjectId,
      ref: 'Campus',
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: '2026-2027',
      index: true,
    },
    cardNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    templateId: {
      type: String,
      required: true,
      enum: ['modern-blue', 'classic-white', 'premium-school', 'minimal', 'custom'],
      default: 'modern-blue',
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validTill: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'generated', 'active', 'expired', 'revoked'],
      default: 'active',
      index: true,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    fields: {
      showBloodGroup: { type: Boolean, default: true },
      showParentName: { type: Boolean, default: true },
      showParentPhone: { type: Boolean, default: true },
      showAddress: { type: Boolean, default: true },
      showEmergencyContact: { type: Boolean, default: true },
      showQRCode: { type: Boolean, default: true },
      showBarcode: { type: Boolean, default: true },
      house: { type: String, trim: true },
      notes: { type: String, trim: true },
    },
    verificationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    barcodeValue: {
      type: String,
      required: true,
      trim: true,
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
    revocationReason: {
      type: String,
      trim: true,
    },
    revokedAt: {
      type: Date,
    },
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
    },
    schoolBranding: {
      logoUrl: { type: String, default: '/logo.png' },
      schoolName: { type: String, default: 'GGPS School' },
      tagline: { type: String, default: 'Learn • Grow • Succeed' },
      address: { type: String, default: '123 Education Lane, Knowledge Park' },
      phone: { type: String, default: '+91 98765 43210' },
      email: { type: String, default: 'admissions@ggps.edu' },
      website: { type: String, default: 'https://ggps-school.edu' },
      primaryColor: { type: String, default: '#0050CB' },
      secondaryColor: { type: String, default: '#FF690C' },
      principalSignatureUrl: { type: String, default: '/signature-principal.png' },
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes
IdCardSchema.index({ studentId: 1, status: 1 });
IdCardSchema.index({ schoolId: 1, academicYear: 1 });

export default mongoose.models.IdCard || mongoose.model<IIdCard>('IdCard', IdCardSchema);
