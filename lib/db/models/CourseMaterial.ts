import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseMaterial extends Document {
  title: string;
  board: string;
  grade: string;
  subject: string;
  topic: string;
  fileName: string;
  sourceType: 'pdf' | 'text' | 'url';
  fileSize: number;
  chunkCount: number;
  uploadedBy: string;
  status: 'processing' | 'ready' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseMaterialSchema = new Schema<ICourseMaterial>(
  {
    title: { type: String, required: true },
    board: { type: String, required: true },
    grade: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    fileName: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ['pdf', 'text', 'url'],
      required: true,
    },
    fileSize: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    uploadedBy: { type: String, required: true },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

CourseMaterialSchema.index({ board: 1, grade: 1, subject: 1 });
CourseMaterialSchema.index({ uploadedBy: 1 });
CourseMaterialSchema.index({ status: 1 });

export default mongoose.models.CourseMaterial ||
  mongoose.model<ICourseMaterial>('CourseMaterial', CourseMaterialSchema);
