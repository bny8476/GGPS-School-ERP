import mongoose, { Schema, Document } from 'mongoose';

const NAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z\s'.-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\d{10}$/;

export interface IParent extends Document {
  fatherName: string;
  fatherOccupation?: string;
  fatherContact?: string;
  motherName: string;
  motherOccupation?: string;
  motherContact?: string;
  guardianName?: string;
  guardianContact?: string;
  primaryEmail: string;
  address: string;
  whatsappNumber?: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ParentSchema: Schema = new Schema(
  {
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
      minlength: [2, "Father's name must be at least 2 characters"],
      maxlength: [80, "Father's name cannot exceed 80 characters"],
      match: [NAME_REGEX, "Father's name can contain only letters, spaces, hyphens, and apostrophes"],
    },
    fatherOccupation: { type: String, trim: true, maxlength: 80 },
    fatherContact: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || PHONE_REGEX.test(v);
        },
        message: 'Contact must be a valid 10-digit number',
      },
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
      minlength: [2, "Mother's name must be at least 2 characters"],
      maxlength: [80, "Mother's name cannot exceed 80 characters"],
      match: [NAME_REGEX, "Mother's name can contain only letters, spaces, hyphens, and apostrophes"],
    },
    motherOccupation: { type: String, trim: true, maxlength: 80 },
    motherContact: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || PHONE_REGEX.test(v);
        },
        message: 'Contact must be a valid 10-digit number',
      },
    },
    guardianName: {
      type: String,
      trim: true,
      maxlength: 80,
      match: [NAME_REGEX, "Guardian's name can contain only letters, spaces, hyphens, and apostrophes"],
    },
    guardianContact: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || PHONE_REGEX.test(v);
        },
        message: 'Guardian contact must be a valid 10-digit number',
      },
    },
    primaryEmail: {
      type: String,
      required: [true, 'Primary email address is required'],
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Enter a valid email address'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters'],
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    whatsappNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || PHONE_REGEX.test(v);
        },
        message: 'WhatsApp number must be a valid 10-digit number',
      },
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Parent || mongoose.model<IParent>('Parent', ParentSchema);
