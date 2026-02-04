import mongoose, { Schema, Document } from 'mongoose';
import './Question';

export enum QuestionType {
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

export interface IQuestion {
  text: string;
  type: QuestionType;
  options?: string[]; // For MCQ, etc.
  correctAnswer?: string | string[]; // Can be text or array of matches
  mediaUrl?: string; // For picture based
  marks: number;
}

export interface ISection {
  title: string;
  description?: string;
  questions: IQuestion[] | mongoose.Types.ObjectId[]; // Can be populated or refs
}

export interface ITest extends Document {
  title: string;
  subject: string;
  board?: string; // e.g. NIOS, CBSE
  grade?: string; // e.g. A, B, C or 10, 12
  visibility: 'public' | 'private';
  isTimed?: boolean;
  durationMinutes?: number; // total when isTimed is true
  createdBy: string; // Clerk ID of teacher
  sections: ISection[];
  questions?: IQuestion[] | mongoose.Types.ObjectId[]; // Keeping for backward compat
  // We can also have a flat array of refs if needed:
  // questionRefs?: mongoose.Types.ObjectId[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  versionHistory?: IVersionHistory[];
}

export interface IVersionHistory {
  modifiedAt: Date;
  modifiedBy: string;
  action?: string;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  type: { type: String, enum: Object.values(QuestionType), required: true },
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed }, // Flexible for different types
  mediaUrl: { type: String },
  marks: { type: Number, default: 1 },
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  description: { type: String },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
});

const TestSchema = new Schema<ITest>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    board: { type: String },
    grade: { type: String },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    isTimed: { type: Boolean, default: false },
    durationMinutes: { type: Number },
    createdBy: { type: String, required: true },
    sections: [SectionSchema],
    questions: [QuestionSchema], // Deprecated but Schema remains valid
    isPublished: { type: Boolean, default: false },
    versionHistory: [
      {
        modifiedAt: { type: Date, default: Date.now },
        modifiedBy: { type: String, required: true },
        action: { type: String }, // Optional: describe what changed e.g. "update", "publish"
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Test ||
  mongoose.model<ITest>('Test', TestSchema);
