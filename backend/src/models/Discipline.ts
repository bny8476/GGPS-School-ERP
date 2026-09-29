import mongoose, { Schema, Document } from 'mongoose';

export interface IDisciplineIncident extends Document {
  student?: mongoose.Types.ObjectId;
  studentName: string;
  category: 'Behavioral' | 'Academic Dishonesty' | 'Academic Integrity' | 'Attendance' | 'Vandalism' | 'Bullying' | 'Dress Code' | 'Property Damage' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Severe';
  incidentDate: Date;
  location?: string;
  description: string;
  reportedBy?: mongoose.Types.ObjectId;
  reportedByName?: string;
  actionTaken: string;
  parentNotified: boolean;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const DisciplineIncidentSchema: Schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: false },
    studentName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Behavioral',
        'Academic Dishonesty',
        'Academic Integrity',
        'Attendance',
        'Vandalism',
        'Bullying',
        'Dress Code',
        'Property Damage',
        'Other',
      ],
      required: true,
    },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Severe'], default: 'Medium' },
    incidentDate: { type: Date, default: Date.now },
    location: { type: String },
    description: { type: String, required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    reportedByName: { type: String },
    actionTaken: { type: String, required: true },
    parentNotified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Open', 'Under Investigation', 'Resolved', 'Closed'],
      default: 'Under Investigation',
    },
  },
  { timestamps: true }
);

export default mongoose.models.DisciplineIncident ||
  mongoose.model<IDisciplineIncident>('DisciplineIncident', DisciplineIncidentSchema);
