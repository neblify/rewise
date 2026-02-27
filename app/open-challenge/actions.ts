'use server';

import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';
import Friend from '@/lib/db/models/Friend';
import User from '@/lib/db/models/User';
import { generateQuestionsAI } from '@/app/teacher/create-test/ai-actions';
import { sendOpenChallengeInvite } from '@/lib/email';
import { z } from 'zod';

const OPEN_BOARD = 'General';
const OPEN_GRADE = 'Any';

const questionSchema = z.object({
  text: z.string().min(1),
  type: z.string(),
  options: z.array(z.string()).optional(),
  leftColumn: z.array(z.string()).optional(),
  correctAnswer: z
    .union([z.string(), z.array(z.string()), z.array(z.number())])
    .optional(),
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
  return generateQuestionsAI(
    topic,
    count,
    type,
    difficulty,
    OPEN_BOARD,
    OPEN_GRADE
  );
}

export async function createOpenChallengeTest(
  prevState: unknown,
  formData: FormData
) {
  const { userId } = await currentAuth();
  if (!userId) return { message: 'Sign in required' };

  let sectionsData: unknown;
  try {
    const sectionsString = formData.get('sections') as string;
    if (sectionsString.length > 4.5 * 1024 * 1024) {
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
        return {
          title: section.title,
          description: section.description,
          questions: questionRefs,
        };
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
    if (
      !result ||
      !test ||
      result.studentId !== userId ||
      String(result.testId) !== String(challengeTestId)
    ) {
      return { error: 'Invalid challenge or result' };
    }

    // Open Challenge must never create or update User records for invitees (by email or otherwise)
    // and must not change any user's role. Invitees keep their existing profile (student/teacher/parent).
    await Friend.create({
      addedBy: userId,
      email: trimmed,
      challengeTestId,
      challengeResultId,
      scoreToBeat,
    });

    const inviterUser = await User.findOne({ clerkId: userId })
      .select('firstName lastName email')
      .lean();
    const inviterDisplayName =
      inviterUser &&
      [inviterUser.firstName, inviterUser.lastName].filter(Boolean).join(' ');
    const inviterLabel = (inviterDisplayName?.trim() || inviterUser?.email) ?? undefined;

    const emailResult = await sendOpenChallengeInvite(trimmed, {
      testTitle: test.title ?? 'Open Challenge',
      scoreToBeat,
      testId: challengeTestId,
      inviterDisplayName: inviterLabel,
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
  const filter: { addedBy: string; challengeTestId?: unknown } = {
    addedBy: userId,
  };
  if (challengeTestId) filter.challengeTestId = challengeTestId;

  const friends = await Friend.find(filter).sort({ createdAt: -1 }).lean();
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

  if (!isOwner && !isFriend)
    return { error: 'Not allowed to update this profile' };

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

/** Delete an Open Challenge test. Only the creator can delete. Cascades to results, questions, and friend invites. */
export async function deleteOpenChallengeTest(testId: string) {
  const { userId } = await currentAuth();
  if (!userId) return { error: 'Sign in required' };

  await dbConnect();
  const test = await Test.findOne({
    _id: testId,
    openChallenge: true,
    createdBy: userId,
  });
  if (!test)
    return {
      error:
        'Open Challenge not found or you do not have permission to delete it',
    };

  await Friend.deleteMany({ challengeTestId: testId });
  await Result.deleteMany({ testId });
  const questionIds: string[] = [];
  if (test.sections?.length) {
    for (const section of test.sections) {
      const qs = (section as { questions?: unknown[] }).questions;
      if (Array.isArray(qs))
        qs.forEach((qId: unknown) => questionIds.push(String(qId)));
    }
  }
  if (questionIds.length)
    await Question.deleteMany({ _id: { $in: questionIds } });
  await Test.deleteOne({ _id: testId });
  return { success: true };
}

export async function getMyOpenChallengeResults() {
  const { userId } = await currentAuth();
  if (!userId) return { results: [] };

  await dbConnect();
  const myResults = await Result.find({ studentId: userId })
    .select('testId totalScore maxScore createdAt')
    .sort({ createdAt: -1 })
    .lean();
  const attemptedTestIds = [
    ...new Set(myResults.map(r => r.testId?.toString()).filter(Boolean)),
  ];
  const openChallengeTests = await Test.find({
    _id: { $in: attemptedTestIds },
    openChallenge: true,
  })
    .select('_id title createdBy')
    .lean();
  const testMap = new Map(
    openChallengeTests.map(t => [
      String(t._id),
      { title: t.title ?? 'Open Challenge', createdBy: t.createdBy },
    ])
  );
  const creatorIds = [
    ...new Set(openChallengeTests.map(t => t.createdBy).filter(Boolean)),
  ];
  const creators = await User.find({ clerkId: { $in: creatorIds } })
    .select('clerkId firstName lastName')
    .lean();
  const creatorNameMap = new Map(
    creators.map(c => {
      const name =
        [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown';
      return [c.clerkId, name];
    })
  );
  return {
    results: myResults
      .filter(r => testMap.has(r.testId?.toString() ?? ''))
      .map(r => {
        const testIdStr = r.testId?.toString() ?? '';
        const meta = testMap.get(testIdStr);
        const createdBy = meta?.createdBy ?? '';
        return {
          _id: r._id.toString(),
          testId: testIdStr,
          title: meta?.title ?? 'Open Challenge',
          totalScore: r.totalScore,
          maxScore: r.maxScore,
          createdAt: r.createdAt,
          creatorName: creatorNameMap.get(createdBy) ?? 'Unknown',
          isOwner: createdBy === userId,
        };
      }),
  };
}

/** Invites where the current user (by email or linkedClerkId) is the invitee. Only for existing accounts (logged-in users). */
export async function getOpenChallengeInvitesForCurrentUser(): Promise<{
  invites: {
    testId: string;
    testTitle: string;
    scoreToBeat?: number;
    inviterDisplayName?: string;
  }[];
}> {
  const { userId } = await currentAuth();
  if (!userId) return { invites: [] };

  await dbConnect();

  let primaryEmail: string | null = null;
  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    primaryEmail = user.primaryEmailAddress?.emailAddress ?? null;
  } catch {
    // Mock session or Clerk unavailable
  }

  const filter: { $or: ({ email: string } | { linkedClerkId: string })[] } = {
    $or: [{ linkedClerkId: userId }],
  };
  if (primaryEmail?.trim()) {
    filter.$or.push({ email: primaryEmail.trim().toLowerCase() });
  }

  const friendRecords = await Friend.find(filter)
    .select('challengeTestId challengeResultId scoreToBeat addedBy')
    .lean();

  const testIds = [
    ...new Set(friendRecords.map(f => f.challengeTestId).filter(Boolean)),
  ];
  const tests = await Test.find({ _id: { $in: testIds }, openChallenge: true })
    .select('_id title')
    .lean();
  const testMap = new Map(
    tests.map(t => [String(t._id), t.title ?? 'Open Challenge'])
  );

  const inviterIds = [
    ...new Set(friendRecords.map(f => f.addedBy).filter(Boolean)),
  ];
  const inviterUsers = await User.find({ clerkId: { $in: inviterIds } })
    .select('clerkId firstName lastName email')
    .lean();
  const inviterNameMap = new Map<string, string>();
  const inviterEmailMap = new Map<string, string>();
  for (const u of inviterUsers) {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    inviterNameMap.set(u.clerkId, name || u.email);
    if (u.email?.trim()) inviterEmailMap.set(u.clerkId, u.email.trim().toLowerCase());
  }

  // Add inviter as friend of invitee (so invitee sees inviter in their friends list)
  for (const f of friendRecords) {
    const inviterClerkId = f.addedBy as string | undefined;
    const inviterEmail = inviterClerkId ? inviterEmailMap.get(inviterClerkId) : undefined;
    if (!inviterEmail || !f.challengeTestId || !f.challengeResultId) continue;
    const inviterName = inviterClerkId ? inviterNameMap.get(inviterClerkId) : undefined;
    await Friend.findOneAndUpdate(
      {
        addedBy: userId,
        challengeTestId: f.challengeTestId,
        email: inviterEmail,
      },
      {
        $setOnInsert: {
          addedBy: userId,
          email: inviterEmail,
          challengeTestId: f.challengeTestId,
          challengeResultId: f.challengeResultId,
          scoreToBeat: f.scoreToBeat,
          ...(inviterName && { name: inviterName }),
        },
      },
      { upsert: true }
    );
  }

  // Exclude invites for challenges the user has already attempted
  const attemptedTestIds = new Set(
    (
      await Result.find({ studentId: userId, testId: { $in: testIds } })
        .select('testId')
        .lean()
    )
      .map(r => r.testId?.toString())
      .filter(Boolean)
  );

  const seen = new Set<string>();
  const invites: {
    testId: string;
    testTitle: string;
    scoreToBeat?: number;
    inviterDisplayName?: string;
  }[] = [];
  for (const f of friendRecords) {
    const testId = f.challengeTestId?.toString();
    if (
      !testId ||
      !testMap.has(testId) ||
      seen.has(testId) ||
      attemptedTestIds.has(testId)
    )
      continue;
    seen.add(testId);
    const addedBy = f.addedBy as string | undefined;
    invites.push({
      testId,
      testTitle: testMap.get(testId)!,
      scoreToBeat: f.scoreToBeat,
      inviterDisplayName: addedBy ? inviterNameMap.get(addedBy) : undefined,
    });
  }

  return { invites };
}
