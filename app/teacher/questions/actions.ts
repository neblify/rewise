'use server';

import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Question from '@/lib/db/models/Question';
import { isAdmin } from '@/lib/auth/isAdmin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateQuestionSchema = z.object({
  questionId: z.string().min(1),
  text: z.string().min(1, 'Question text is required'),
  type: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  marks: z.number().min(1),
  subject: z.string().optional(),
  board: z.string().optional(),
  grade: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
});

export async function updateQuestion(prevState: unknown, formData: FormData) {
  const { userId } = await currentAuth();

  if (!userId) {
    return { success: false, message: 'Unauthorized' };
  }

  let data;
  try {
    const raw = formData.get('data') as string;
    data = JSON.parse(raw);
  } catch {
    return { success: false, message: 'Invalid data format' };
  }

  const validated = updateQuestionSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message:
        'Invalid input: ' +
        JSON.stringify(validated.error.flatten().fieldErrors),
    };
  }

  await dbConnect();

  const admin = await isAdmin(userId);
  const filter = admin
    ? { _id: validated.data.questionId }
    : { _id: validated.data.questionId, createdBy: userId };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { questionId: _id, ...updateFields } = validated.data;

  const result = await Question.findOneAndUpdate(filter, {
    $set: updateFields,
  });

  if (!result) {
    return {
      success: false,
      message: 'Question not found or you do not have permission to edit it',
    };
  }

  revalidatePath('/teacher/questions');
  return { success: true, message: 'Question updated successfully' };
}

export async function deleteQuestion(questionId: string) {
  const { userId } = await currentAuth();

  if (!userId) {
    return { success: false, message: 'Unauthorized' };
  }

  await dbConnect();

  const admin = await isAdmin(userId);
  const filter = admin
    ? { _id: questionId }
    : { _id: questionId, createdBy: userId };

  const result = await Question.findOneAndDelete(filter);

  if (!result) {
    return {
      success: false,
      message: 'Question not found or you do not have permission to delete it',
    };
  }

  revalidatePath('/teacher/questions');
  return { success: true, message: 'Question deleted successfully' };
}
