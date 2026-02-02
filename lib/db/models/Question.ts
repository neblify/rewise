import mongoose, { Schema, Document } from 'mongoose';

enum QuestionType {
  FILL_BLANKS = 'fill_in_blanks',
  MATCH_COLUMNS = 'match_columns',
  TRUE_FALSE = 'true_false',
  SINGLE_WORD = 'single_word',
  ONE_SENTENCE = 'one_sentence',
  PICTURE_BASED = 'picture_based',
  MCQ = 'mcq',
  BRIEF_ANSWER = 'brief_answer',
  DIFFERENCE = 'difference',
}

interface IQuestion extends Document {
  text: string;
  type: QuestionType;
  options?: string[]; // For MCQ, etc.
  correctAnswer?: string | string[]; // Can be text or array of matches
  mediaUrl?: string; // For picture based
  marks: number;
  subject?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  createdBy: string; // Clerk ID
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    type: { type: String, enum: Object.values(QuestionType), required: true },
    options: [{ type: String }],
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
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Question ||
  mongoose.model<IQuestion>('Question', QuestionSchema);
