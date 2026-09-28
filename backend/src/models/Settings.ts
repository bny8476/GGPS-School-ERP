import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  schoolName: string;
  schoolTagline?: string;
  schoolEmail?: string;
  schoolPhone?: string;
  schoolAddress?: string;
  academicYear: string;
  currency: string;
  timezone: string;
  language: string;
  enableSMS: boolean;
  enableEmailNotifications: boolean;
  paymentGatewayKey?: string;
  logoUrl?: string;
  website?: string;
  primaryColor?: string;
  secondaryColor?: string;
  principalSignatureUrl?: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingsSchema: Schema = new Schema(
  {
    schoolName: { type: String, required: true, default: 'GGPS School' },
    schoolTagline: { type: String, default: 'Learn • Grow • Succeed' },
    schoolEmail: { type: String, default: 'admissions@ggps.edu' },
    schoolPhone: { type: String, default: '+91 98765 43210' },
    schoolAddress: { type: String, default: '123 Education Lane, Knowledge Park, Tamil Nadu, India' },
    academicYear: { type: String, default: '2026-2027' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    language: { type: String, default: 'en' },
    enableSMS: { type: Boolean, default: true },
    enableEmailNotifications: { type: Boolean, default: true },
    paymentGatewayKey: { type: String, default: '' },
    logoUrl: { type: String, default: '/logo.png' },
    website: { type: String, default: 'https://ggps-school.edu' },
    primaryColor: { type: String, default: '#0050CB' },
    secondaryColor: { type: String, default: '#FF690C' },
    principalSignatureUrl: { type: String, default: '/signature-principal.png' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
