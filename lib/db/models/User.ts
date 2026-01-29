import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  role: 'student' | 'teacher' | 'parent';
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent'],
      default: 'student',
    },
    firstName: { type: String },
    lastName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
