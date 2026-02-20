import { getVectorIndex } from './client';
import type { VectorMetadata } from './types';

/**
 * Upsert text chunks into Upstash Vector with metadata.
 * Uses the `data` field so Upstash embeds with BGE_M3 automatically.
 */
export async function upsertChunks(
  materialId: string,
  chunks: { text: string; index: number }[],
  metadata: Omit<VectorMetadata, 'materialId' | 'chunkIndex'>
): Promise<void> {
  const index = getVectorIndex();

  const batchSize = 100;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    await index.upsert(
      batch.map(chunk => ({
        id: `${materialId}_${chunk.index}`,
        data: chunk.text,
        metadata: {
          ...metadata,
          materialId,
          chunkIndex: chunk.index,
        } satisfies VectorMetadata,
      }))
    );
  }
}

/**
 * Query relevant chunks from the vector database with metadata filtering.
 */
export async function queryRelevantChunks(
  queryText: string,
  filters: { board?: string; grade?: string; subject?: string },
  topK: number = 5
): Promise<{ text: string; score: number; metadata: VectorMetadata }[]> {
  const index = getVectorIndex();

  // Build Upstash metadata filter string (SQL-like syntax)
  const filterParts: string[] = [];
  if (filters.board) filterParts.push(`board = '${filters.board}'`);
  if (filters.grade) filterParts.push(`grade = '${filters.grade}'`);
  if (filters.subject) filterParts.push(`subject = '${filters.subject}'`);
  const filterString =
    filterParts.length > 0 ? filterParts.join(' AND ') : undefined;

  const results = await index.query({
    data: queryText,
    topK,
    includeData: true,
    includeMetadata: true,
    filter: filterString,
  });

  return results
    .filter(r => r.data && r.metadata)
    .map(r => ({
      text: r.data as string,
      score: r.score,
      metadata: r.metadata as unknown as VectorMetadata,
    }));
}

/**
 * Delete all vectors for a given material by ID range.
 */
export async function deleteVectorsForMaterial(
  materialId: string,
  chunkCount: number
): Promise<void> {
  const index = getVectorIndex();
  const ids = Array.from(
    { length: chunkCount },
    (_, i) => `${materialId}_${i}`
  );

  const batchSize = 1000;
  for (let i = 0; i < ids.length; i += batchSize) {
    await index.delete(ids.slice(i, i + batchSize));
  }
}
