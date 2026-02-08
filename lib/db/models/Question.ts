import mongoose, { Schema, Document } from 'mongoose';
import { QuestionType } from '@/lib/constants/question-types';

export { QuestionType };

interface IQuestion extends Document {
  text: string;
  type: QuestionType;
  options?: string[]; // For MCQ options; for match_columns = right column (values)
  leftColumn?: string[]; // For match_columns only: left column (keys)
  correctAnswer?: string | string[] | number[]; // For match_columns: number[] (right index per left index)
  mediaUrl?: string; // For picture based
  marks: number;
  subject?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  board?: string;
  grade?: string;
  createdBy: string; // Clerk ID
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    type: { type: String, enum: Object.values(QuestionType), required: true },
    options: [{ type: String }],
    leftColumn: [{ type: String }], // match_columns: left column items
    correctAnswer: { type: Schema.Types.Mixed }, // Flexible for different types
    mediaUrl: { type: String },
    marks: { type: Number, default: 1 },
    subject: { type: String },
    topic: { type: String },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: [{ type: String }],
    board: { type: String },
    grade: { type: String },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ createdBy: 1, board: 1, subject: 1, grade: 1 });

export default mongoose.models.Question ||
  mongoose.model<IQuestion>('Question', QuestionSchema);
