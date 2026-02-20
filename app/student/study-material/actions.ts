'use server';

import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import CourseMaterial from '@/lib/db/models/CourseMaterial';
import { queryRelevantChunks } from '@/lib/vector/operations';

export async function searchCourseMaterial(
  query: string,
  filters: { board?: string; grade?: string; subject?: string }
) {
  const { userId } = await currentAuth();
  if (!userId) return { error: 'Unauthorized', results: [] };

  if (!query || query.trim().length < 3) {
    return { error: 'Search query must be at least 3 characters', results: [] };
  }
  if (query.length > 500) {
    return { error: 'Search query is too long', results: [] };
  }

  try {
    const chunks = await queryRelevantChunks(query.trim(), filters, 8);

    return {
      error: null,
      results: chunks.map(c => ({
        text: c.text,
        score: c.score,
        subject: c.metadata.subject,
        topic: c.metadata.topic,
        board: c.metadata.board,
        grade: c.metadata.grade,
        fileName: c.metadata.fileName,
        sourceType: c.metadata.sourceType,
      })),
    };
  } catch (error) {
    console.error('Search error:', error);
    return { error: 'Search failed. Please try again.', results: [] };
  }
}

export async function getAvailableSubjects(board?: string, grade?: string) {
  await dbConnect();

  const query: Record<string, string> = { status: 'ready' };
  if (board) query.board = board;
  if (grade) query.grade = grade;

  const materials = await CourseMaterial.find(query)
    .select('subject topic title')
    .sort({ subject: 1, topic: 1 });

  return JSON.parse(JSON.stringify(materials));
}
