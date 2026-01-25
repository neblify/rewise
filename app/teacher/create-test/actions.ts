'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
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

        // Helper to process sections and create questions
        const sectionsWithRefs = await Promise.all(validated.data.sections.map(async (section) => {
            const questionRefs = await Promise.all(section.questions.map(async (q) => {
                const questionDoc = await Question.create({
                    ...q,
                    createdBy: userId,
                    subject: validated.data.subject, // Inherit subject
                });
                return questionDoc._id;
            }));

            return {
                ...section,
                questions: questionRefs,
            };
        }));

        await Test.create({
            ...validated.data,
            sections: sectionsWithRefs,
            createdBy: userId,
            isPublished: true,
        });
    } catch (e) {
        console.error(e);
        return { message: 'Failed to create test' };
    }

    redirect('/teacher');
}

export async function updateTest(prevState: any, formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        return { message: 'Unauthorized' };
    }

    const testId = formData.get('testId');
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

        // Process sections (new or updated)
        // Note: For updates, if questions are modified, we ideally should detect that. 
        // For simplicity, we'll create new questions for now if they don't have IDs (which rawData won't have)
        // A full update strategy would require checking if questions exist. 
        // Since the UI sends the whole object, and we are decoupling, let's treat them as new versions or 
        // we would need a more complex UI to send question IDs.
        // CURRENT STRATEGY: Create new questions for the updated sections. 
        // Old questions will become orphaned (orphaned cleanup is a separate task).

        const sectionsWithRefs = await Promise.all(validated.data.sections.map(async (section) => {
            const questionRefs = await Promise.all(section.questions.map(async (q) => {
                const questionDoc = await Question.create({
                    ...q,
                    createdBy: userId,
                    subject: validated.data.subject,
                });
                return questionDoc._id;
            }));

            return {
                ...section,
                questions: questionRefs,
            };
        }));

        // Ensure user owns the test
        await Test.findOneAndUpdate(
            { _id: testId, createdBy: userId },
            {
                ...validated.data,
                sections: sectionsWithRefs,
                // Do not update isPublished or other status fields blindly if not intended
            }
        );
    } catch (e) {
        console.error(e);
        return { message: 'Failed to update test' };
    }

    redirect('/teacher');
}
