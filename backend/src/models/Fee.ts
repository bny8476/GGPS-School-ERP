import mongoose, { Schema, Document } from 'mongoose';

export interface IFeePaymentRecord {
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paidAt: Date;
  paidBy?: mongoose.Types.ObjectId;
  note?: string;
}

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId;
  grade?: string;
  classId?: mongoose.Types.ObjectId;
  feeType: 'Admission' | 'Tuition' | 'Activity' | 'Day Care' | 'Examination' | 'Other';
  title?: string;
  invoiceNumber?: string;
  totalAmount: number;
  amountPaid: number;
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  transactionId?: string;
  receiptNumber?: string;
  status: 'Paid' | 'Partial' | 'Overdue' | 'Pending';
  paymentHistory: IFeePaymentRecord[];
  schoolId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FeePaymentRecordSchema = new Schema(
  {
    receiptNumber: { type: String, required: [true, 'Receipt number is required'], trim: true },
    amount: { type: Number, required: [true, 'Payment amount is required'], min: [0.01, 'Payment amount must be greater than zero'] },
    paymentMethod: { type: String, default: 'Online / UPI', trim: true },
    transactionId: { type: String, trim: true },
    paidAt: { type: Date, default: Date.now },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const FeeSchema: Schema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
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
    feeType: {
      type: String,
      enum: ['Admission', 'Tuition', 'Activity', 'Day Care', 'Examination', 'Other'],
      default: 'Tuition',
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Partial', 'Overdue', 'Pending'],
      default: 'Pending',
      index: true,
    },
    paymentHistory: [FeePaymentRecordSchema],
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

FeeSchema.index({ studentId: 1, status: 1 });
FeeSchema.index({ createdAt: -1 });

export default mongoose.models.Fee || mongoose.model<IFee>('Fee', FeeSchema);
