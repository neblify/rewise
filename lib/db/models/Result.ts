import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
  testId: mongoose.Types.ObjectId;
  studentId: string;
  answers: {
    questionId: string; // or index if simple
    answer: any;
    isCorrect?: boolean;
    marksObtained?: number;
    feedback?: string;
  }[];
  totalScore: number;
  maxScore: number;
  aiFeedback: string; // Overall feedback
  weakAreas: string[];
  createdAt: Date;
}

const ResultSchema = new Schema<IResult>(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    studentId: { type: String, required: true },
    answers: [
      {
        questionId: { type: String },
        answer: { type: Schema.Types.Mixed },
        isCorrect: { type: Boolean },
        marksObtained: { type: Number },
        feedback: { type: String },
      },
    ],
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    aiFeedback: { type: String },
    weakAreas: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Result ||
  mongoose.model<IResult>('Result', ResultSchema);
