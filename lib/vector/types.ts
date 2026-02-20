export interface VectorMetadata {
  materialId: string;
  board: string;
  grade: string;
  subject: string;
  topic: string;
  chunkIndex: number;
  uploadedBy: string;
  fileName: string;
  sourceType: 'pdf' | 'text' | 'url';
}
