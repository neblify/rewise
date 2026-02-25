'use server';

import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';
import Friend from '@/lib/db/models/Friend';
import { generateQuestionsAI } from '@/app/teacher/create-test/ai-actions';
import { sendOpenChallengeInvite } from '@/lib/email';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const OPEN_BOARD = 'General';
const OPEN_GRADE = 'Any';

const questionSchema = z.object({
  text: z.string().min(1),
  type: z.string(),
  options: z.array(z.string()).optional(),
  leftColumn: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string()), z.array(z.number())]).optional(),
  mediaUrl: z.string().optional(),
  marks: z.coerce.number().min(1),
});

const sectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});

const createOpenTestSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
});

export async function generateOpenChallengeQuestions(
  topic: string,
  count: number = 5,
  type: string = 'mcq',
  difficulty: string = 'Medium'
) {
  const { userId } = await currentAuth();
  if (!userId) return { error: 'Sign in required' };
  return generateQuestionsAI(topic, count, type, difficulty, OPEN_BOARD, OPEN_GRADE);
}

export async function createOpenChallengeTest(prevState: unknown, formData: FormData) {
  const { userId } = await currentAuth();
  if (!userId) return { message: 'Sign in required' };

  let sectionsData: unknown;
  try {
    const sectionsString = formData.get('sections') as string;
    if (sectionsString?.length > 4.5 * 1024 * 1024) {
      return { message: 'Test data too large.' };
    }
    sectionsData = JSON.parse(sectionsString || '[]');
  } catch {
    return { message: 'Invalid test data format' };
  }

  const rawData = {
    title: formData.get('title'),
    subject: formData.get('subject'),
    sections: sectionsData,
  };

  const validated = createOpenTestSchema.safeParse(rawData);
  if (!validated.success) {
    const first = validated.error.issues[0];
    return { message: `Invalid: ${first.message}` };
  }

  try {
    await dbConnect();

    const sectionsWithRefs = await Promise.all(
      validated.data.sections.map(async section => {
        const questionRefs = await Promise.all(
          section.questions.map(async q => {
            const { id: _id, ...rest } = q as Record<string, unknown>;
            const questionDoc = await Question.create({
              ...rest,
              createdBy: userId,
              subject: validated.data.subject,
              board: OPEN_BOARD,
              grade: OPEN_GRADE,
            });
            return questionDoc._id;
          })
        );
        return { title: section.title, description: section.description, questions: questionRefs };
      })
    );

    const test = await Test.create({
      title: validated.data.title,
      subject: validated.data.subject,
      board: OPEN_BOARD,
      grade: OPEN_GRADE,
      visibility: 'public',
      isTimed: false,
      sections: sectionsWithRefs,
      createdBy: userId,
      isPublished: true,
      openChallenge: true,
    });

    return { success: true, testId: test._id.toString() };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to create test' };
  }
}

export async function addFriend(
  email: string,
  challengeTestId: string,
  challengeResultId: string,
  scoreToBeat: number
) {
  const { userId } = await currentAuth();
  if (!userId) return { error: 'Sign in required' };

  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { error: 'Email required' };

  try {
    await dbConnect();

    const result = await Result.findById(challengeResultId).lean();
    const test = await Test.findById(challengeTestId).lean();
    if (!result || !test || result.studentId !== userId || String(result.testId) !== String(challengeTestId)) {
      return { error: 'Invalid challenge or result' };
    }

    await Friend.create({
      addedBy: userId,
      email: trimmed,
      challengeTestId,
      challengeResultId,
      scoreToBeat,
    });

    const emailResult = await sendOpenChallengeInvite(trimmed, {
      testTitle: test.title ?? 'Open Challenge',
      scoreToBeat,
      testId: challengeTestId,
    });
    if (!emailResult.sent && emailResult.error) {
      console.warn('Open Challenge invite email not sent:', emailResult.error);
    }

    return { success: true, emailSent: emailResult.sent };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to add friend' };
  }
}

export async function listFriends(challengeTestId?: string) {
  const { userId } = await currentAuth();
  if (!userId) return { error: 'Sign in required', friends: [] };

  await dbConnect();
  const filter: { addedBy: string; challengeTestId?: unknown } = { addedBy: userId };
  if (challengeTestId) filter.challengeTestId = challengeTestId;

  const friends = await Friend.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return {
    friends: friends.map(f => ({
      _id: f._id.toString(),
      email: f.email,
      challengeTestId: f.challengeTestId?.toString(),
      challengeResultId: f.challengeResultId?.toString(),
      scoreToBeat: f.scoreToBeat,
      name: f.name,
      location: f.location,
      class: f.class,
      linkedClerkId: f.linkedClerkId,
    })),
  };
}

export async function updateFriendProfile(
  friendId: string,
  data: { name?: string; location?: string; class?: string }
) {
  const { userId } = await currentAuth();
  if (!userId) return { error: 'Sign in required' };

  await dbConnect();
  const friend = await Friend.findById(friendId);
  if (!friend) return { error: 'Friend not found' };

  const isOwner = friend.addedBy === userId;
  let isFriend = false;
  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primaryEmail = user.primaryEmailAddress?.emailAddress;
    isFriend = primaryEmail?.toLowerCase() === friend.email;
  } catch {
    // ignore
  }

  if (!isOwner && !isFriend) return { error: 'Not allowed to update this profile' };

  if (data.name !== undefined) friend.name = data.name || undefined;
  if (data.location !== undefined) friend.location = data.location || undefined;
  if (data.class !== undefined) friend.class = data.class || undefined;
  if (isFriend) friend.linkedClerkId = userId;
  await friend.save();
  return { success: true };
}

export async function deleteFriend(friendId: string) {
  const { userId } = await currentAuth();
  if (!userId) return { error: 'Sign in required' };

  await dbConnect();
  const friend = await Friend.findById(friendId);
  if (!friend) return { error: 'Friend not found' };

  const isOwner = friend.addedBy === userId;
  if (!isOwner) return { error: 'Not allowed to delete this friend' };

  await friend.deleteOne();
  return { success: true };
}

export async function getMyOpenChallengeResults() {
  const { userId } = await currentAuth();
  if (!userId) return { results: [] };

  await dbConnect();
  const tests = await Test.find({ createdBy: userId, openChallenge: true }).select('_id title').lean();
  const testIds = tests.map(t => t._id);
  const results = await Result.find({ studentId: userId, testId: { $in: testIds } })
    .sort({ createdAt: -1 })
    .lean();
  return {
    results: results.map(r => ({
      _id: r._id.toString(),
      testId: r.testId?.toString(),
      title: tests.find(t => String(t._id) === String(r.testId))?.title ?? 'Open Challenge',
      totalScore: r.totalScore,
      maxScore: r.maxScore,
      createdAt: r.createdAt,
    })),
  };
}
