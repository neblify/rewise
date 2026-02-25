import mongoose, { Schema, Document } from 'mongoose';

export interface IFriend extends Document {
  addedBy: string; // Clerk ID of user who invited
  email: string;
  challengeTestId: mongoose.Types.ObjectId;
  challengeResultId: mongoose.Types.ObjectId;
  scoreToBeat?: number;
  // Optional profile fields; editable by addedBy or by friend when logged in
  name?: string;
  location?: string;
  class?: string;
  linkedClerkId?: string; // Set when friend signs up / logs in
  createdAt: Date;
  updatedAt: Date;
}

const FriendSchema = new Schema<IFriend>(
  {
    addedBy: { type: String, required: true },
    email: { type: String, required: true },
    challengeTestId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    challengeResultId: { type: Schema.Types.ObjectId, ref: 'Result', required: true },
    scoreToBeat: { type: Number },
    name: { type: String },
    location: { type: String },
    class: { type: String },
    linkedClerkId: { type: String },
  },
  { timestamps: true }
);

FriendSchema.index({ addedBy: 1, challengeTestId: 1, email: 1 }, { unique: true });

export default mongoose.models.Friend ||
  mongoose.model<IFriend>('Friend', FriendSchema);
