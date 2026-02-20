import { Index } from '@upstash/vector';

let vectorIndex: Index | null = null;

export function getVectorIndex(): Index {
  if (!vectorIndex) {
    if (
      !process.env.UPSTASH_VECTOR_REST_URL ||
      !process.env.UPSTASH_VECTOR_REST_TOKEN
    ) {
      throw new Error(
        'Missing Upstash Vector environment variables (UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN)'
      );
    }
    vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }
  return vectorIndex;
}
