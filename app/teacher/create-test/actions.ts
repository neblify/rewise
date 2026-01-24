'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const questionSchema = z.object({
    text: z.string().min(1, 'Question text is required'),
    type: z.string(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
    mediaUrl: z.string().optional(),
    marks: z.number().min(1),
});

const sectionSchema = z.object({
    title: z.string().min(1, 'Section title is required'),
    description: z.string().optional(),
    questions: z.array(questionSchema).min(1, 'Section must have at least one question'),
});

const createTestSchema = z.object({
    title: z.string().min(1),
    subject: z.string().min(1),
    board: z.string().min(1),
    grade: z.string().min(1),
    visibility: z.enum(['public', 'private']),
    sections: z.array(sectionSchema).min(1, 'At least one section is required'),
});

export async function createTest(prevState: any, formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        return { message: 'Unauthorized' };
    }

    const rawData = {
        title: formData.get('title'),
        subject: formData.get('subject'),
        board: formData.get('board'),
        grade: formData.get('grade'),
        visibility: formData.get('visibility'),
        sections: JSON.parse(formData.get('sections') as string || '[]'),
    }

    const validated = createTestSchema.safeParse(rawData);

    if (!validated.success) {
        console.error(validated.error.flatten());
        return { message: 'Invalid Input: ' + JSON.stringify(validated.error.flatten().fieldErrors) };
    }

    try {
        await dbConnect();
        await Test.create({
            ...validated.data,
            createdBy: userId,
            isPublished: true,
        });
    } catch (e) {
        console.error(e);
        return { message: 'Failed to create test' };
    }

    redirect('/teacher');
}
