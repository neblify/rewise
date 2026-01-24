import mongoose, { Schema, Document } from 'mongoose';

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
    questions: IQuestion[];
}

export interface ITest extends Document {
    title: string;
    subject: string;
    board?: string; // e.g. NIOS, CBSE
    grade?: string; // e.g. A, B, C or 10, 12
    visibility: 'public' | 'private';
    createdBy: string; // Clerk ID of teacher
    sections: ISection[]; // Questions are now grouped
    questions?: IQuestion[]; // Keeping for backward compat if needed, but we will migrate to sections
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
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
    questions: [QuestionSchema],
});

const TestSchema = new Schema<ITest>(
    {
        title: { type: String, required: true },
        subject: { type: String, required: true },
        board: { type: String },
        grade: { type: String },
        visibility: { type: String, enum: ['public', 'private'], default: 'public' },
        createdBy: { type: String, required: true },
        sections: [SectionSchema],
        questions: [QuestionSchema], // Deprecated but Schema remains valid
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);
