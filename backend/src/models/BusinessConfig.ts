import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessConfig extends Document {
  campusId?: mongoose.Types.ObjectId;
  attendanceThreshold: number; // e.g. 75%
  lateThresholdMinutes: number; // e.g. 15 mins
  passingMarksPercentage: number; // e.g. 40%
  feeReminderDays: number[]; // e.g. [7, 3, 1]
  libraryFinePerDay: number; // e.g. 2.00
  leaveLimitPerYear: number;
  promotionMinGpa: number;
  rules: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessConfigSchema: Schema = new Schema(
  {
    campusId: { type: Schema.Types.ObjectId, ref: 'Campus', unique: true, sparse: true },
    attendanceThreshold: { type: Number, default: 75 },
    lateThresholdMinutes: { type: Number, default: 15 },
    passingMarksPercentage: { type: Number, default: 40 },
    feeReminderDays: { type: [Number], default: [7, 3, 1] },
    libraryFinePerDay: { type: Number, default: 2.0 },
    leaveLimitPerYear: { type: Number, default: 12 },
    promotionMinGpa: { type: Number, default: 2.0 },
    rules: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export default mongoose.models.BusinessConfig || mongoose.model<IBusinessConfig>('BusinessConfig', BusinessConfigSchema);
