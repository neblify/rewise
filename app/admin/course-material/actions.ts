'use server';

import { currentAuth } from '@/lib/auth-wrapper';
import { isAdmin } from '@/lib/auth/isAdmin';
import dbConnect from '@/lib/db/connect';
import CourseMaterial from '@/lib/db/models/CourseMaterial';
import { chunkText } from '@/lib/vector/chunker';
import {
  upsertChunks,
  deleteVectorsForMaterial,
} from '@/lib/vector/operations';
import { parsePdfToText } from '@/lib/pdf/parse';
import { scrapeUrlToText } from '@/lib/scraper/extract';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ingestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  board: z.string().min(1, 'Board is required'),
  grade: z.string().min(1, 'Grade is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  sourceType: z.enum(['pdf', 'text', 'url']),
  url: z.string().optional(),
});

export async function ingestCourseMaterial(
  prevState: unknown,
  formData: FormData
) {
  const { userId } = await currentAuth();
  if (!userId) return { message: 'Unauthorized' };

  const authorized = await isAdmin(userId);
  if (!authorized) return { message: 'Admin access required' };

  const rawData = {
    title: formData.get('title'),
    board: formData.get('board'),
    grade: formData.get('grade'),
    subject: formData.get('subject'),
    topic: formData.get('topic'),
    sourceType: formData.get('sourceType'),
    url: formData.get('url') || undefined,
  };

  const validated = ingestSchema.safeParse(rawData);
  if (!validated.success) {
    return { message: `Invalid Input: ${validated.error.issues[0].message}` };
  }

  const { title, board, grade, subject, topic, sourceType, url } =
    validated.data;
  const file = formData.get('file') as File | null;

  // Validate file/url based on sourceType
  if (sourceType === 'pdf' && (!file || file.size === 0)) {
    return { message: 'Please select a PDF file' };
  }
  if (sourceType === 'text' && (!file || file.size === 0)) {
    return { message: 'Please select a text file' };
  }
  if (sourceType === 'url' && !url) {
    return { message: 'Please enter a URL' };
  }

  await dbConnect();

  const fileName = sourceType === 'url' ? url! : file ? file.name : 'unknown';
  const fileSize = file ? file.size : 0;

  // Create material doc with processing status
  const material = await CourseMaterial.create({
    title,
    board,
    grade,
    subject,
    topic,
    fileName,
    sourceType,
    fileSize,
    chunkCount: 0,
    uploadedBy: userId,
    status: 'processing',
  });

  try {
    // Extract text based on source type
    let text = '';

    if (sourceType === 'pdf') {
      text = await parsePdfToText(file!);
    } else if (sourceType === 'text') {
      text = await file!.text();
    } else if (sourceType === 'url') {
      const scraped = await scrapeUrlToText(url!);
      text = scraped.text;
    }

    if (!text || text.trim().length < 50) {
      await CourseMaterial.findByIdAndUpdate(material._id, {
        status: 'failed',
        errorMessage: 'Extracted text is too short (less than 50 characters)',
      });
      return {
        message: 'Extracted text is too short. Please check the source.',
      };
    }

    // Chunk the text
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      await CourseMaterial.findByIdAndUpdate(material._id, {
        status: 'failed',
        errorMessage: 'No valid chunks could be created from the content',
      });
      return { message: 'Could not create valid chunks from the content.' };
    }

    // Upsert to vector database
    await upsertChunks(material._id.toString(), chunks, {
      board,
      grade,
      subject,
      topic,
      uploadedBy: userId,
      fileName,
      sourceType,
    });

    // Update material as ready
    await CourseMaterial.findByIdAndUpdate(material._id, {
      status: 'ready',
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during ingestion';
    await CourseMaterial.findByIdAndUpdate(material._id, {
      status: 'failed',
      errorMessage,
    });
    return { message: `Ingestion failed: ${errorMessage}` };
  }

  revalidatePath('/admin/course-material');
  return { message: 'success' };
}

export async function deleteCourseMaterial(materialId: string) {
  const { userId } = await currentAuth();
  if (!userId) return { success: false, message: 'Unauthorized' };

  const authorized = await isAdmin(userId);
  if (!authorized) return { success: false, message: 'Admin access required' };

  await dbConnect();

  const material = await CourseMaterial.findById(materialId);
  if (!material) return { success: false, message: 'Material not found' };

  try {
    // Delete vectors if material was processed
    if (material.chunkCount > 0) {
      await deleteVectorsForMaterial(materialId, material.chunkCount);
    }

    await CourseMaterial.findByIdAndDelete(materialId);
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, message: 'Failed to delete material' };
  }

  revalidatePath('/admin/course-material');
  return { success: true, message: 'Material deleted' };
}

export async function getCourseMaterials() {
  await dbConnect();
  const materials = await CourseMaterial.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(materials));
}
