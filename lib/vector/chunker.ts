export interface TextChunk {
  text: string;
  index: number;
}

/**
 * Splits text into overlapping chunks suitable for vector embedding.
 *
 * Strategy:
 * 1. Split on paragraph boundaries (\n\n)
 * 2. Greedily combine paragraphs up to maxChars
 * 3. If a single paragraph exceeds maxChars, split on sentence boundaries
 * 4. Apply overlap between consecutive chunks
 * 5. Discard chunks shorter than 100 chars
 */
export function chunkText(
  text: string,
  maxChars: number = 3200,
  overlap: number = 200
): TextChunk[] {
  // Normalize whitespace
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!normalized) return [];

  // Split into paragraphs
  const paragraphs = normalized.split(/\n\n/).filter(p => p.trim().length > 0);

  // Build raw chunks from paragraphs
  const rawChunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();

    if (!current) {
      current = trimmed;
      continue;
    }

    if (current.length + trimmed.length + 2 <= maxChars) {
      current += '\n\n' + trimmed;
    } else {
      // Flush current chunk
      rawChunks.push(current);

      // If this paragraph alone exceeds maxChars, split on sentences
      if (trimmed.length > maxChars) {
        const sentenceChunks = splitBySentences(trimmed, maxChars);
        // Add all but last as separate chunks; last becomes current
        for (let i = 0; i < sentenceChunks.length - 1; i++) {
          rawChunks.push(sentenceChunks[i]);
        }
        current = sentenceChunks[sentenceChunks.length - 1];
      } else {
        current = trimmed;
      }
    }
  }

  // Flush remaining
  if (current.trim()) {
    rawChunks.push(current);
  }

  // Apply overlap between chunks
  const overlappedChunks: string[] = [];
  for (let i = 0; i < rawChunks.length; i++) {
    if (i === 0) {
      overlappedChunks.push(rawChunks[i]);
    } else {
      const prevChunk = rawChunks[i - 1];
      const overlapText = prevChunk.slice(-overlap);
      overlappedChunks.push(overlapText + '\n\n' + rawChunks[i]);
    }
  }

  // Filter out small chunks and assign indices
  return overlappedChunks
    .filter(chunk => chunk.trim().length >= 100)
    .map((text, index) => ({ text: text.trim(), index }));
}

function splitBySentences(text: string, maxChars: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (!current) {
      current = sentence;
      continue;
    }

    if (current.length + sentence.length + 1 <= maxChars) {
      current += ' ' + sentence;
    } else {
      chunks.push(current);
      current = sentence;
    }
  }

  if (current.trim()) {
    chunks.push(current);
  }

  // If a single sentence exceeds maxChars, hard-split on word boundaries
  return chunks.flatMap(chunk => {
    if (chunk.length <= maxChars) return [chunk];
    return hardSplit(chunk, maxChars);
  });
}

function hardSplit(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (current.length + word.length + 1 <= maxChars) {
      current += ' ' + word;
    } else {
      chunks.push(current);
      current = word;
    }
  }

  if (current.trim()) {
    chunks.push(current);
  }

  return chunks;
}
