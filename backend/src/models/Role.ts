import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: [
        'SuperAdmin',
        'Admin',
        'Principal',
        'Teacher',
        'Parent',
        'Accountant',
        'Receptionist',
        'HR',
        'Librarian',
        'Staff',
      ],
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
