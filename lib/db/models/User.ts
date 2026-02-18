import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  clerkId: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin' | 'pending';
  firstName?: string;
  lastName?: string;
  school?: string;
  onboardingStep?: 'school' | 'role';
  board?: string;
  grade?: string;
  children?: string[]; // clerkIds of linked students
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin', 'pending'],
      default: 'pending',
    },
    firstName: { type: String },
    lastName: { type: String },
    school: { type: String },
    onboardingStep: { type: String, enum: ['school', 'role'] },
    board: { type: String },
    grade: { type: String },
    children: [{ type: String }], // Array of student clerkIds
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
