'use server';

import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';
import Friend from '@/lib/db/models/Friend';

export async function getAdminStats() {
  await dbConnect();

  const [teachers, students, parents, tests, questions, challenges] =
    await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'parent' }),
      Test.countDocuments(),
      Question.countDocuments(),
      Test.countDocuments({ openChallenge: true }),
    ]);

  return {
    teachers,
    students,
    parents,
    tests,
    questions,
    challenges,
  };
}

export async function getUsers(role?: string) {
  await dbConnect();
  const query = role ? { role } : {};
  const users = await User.find(query).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export async function getTests() {
  await dbConnect();
  const tests = await Test.find({ openChallenge: { $ne: true } }).sort({
    createdAt: -1,
  });

  if (!tests.length) {
    return [];
  }

  const plainTests: Array<{
    _id: unknown;
    title?: unknown;
    subject?: unknown;
    createdAt?: unknown;
    isPublished?: unknown;
    createdBy?: unknown;
    [key: string]: unknown;
  }> = JSON.parse(
    JSON.stringify(
      tests as Array<{
        _id: unknown;
        title?: unknown;
        subject?: unknown;
        createdAt?: unknown;
        isPublished?: unknown;
        createdBy?: unknown;
        [key: string]: unknown;
      }>
    )
  );

  const clerkIds = Array.from(
    new Set(
      plainTests
        .map(t => t.createdBy)
        .filter(
          (id): id is string =>
            typeof id === 'string' && id.trim().length > 0
        )
    )
  );

  let creators: Array<{
    clerkId?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
  }> = [];

  if (clerkIds.length) {
    const creatorDocs = await User.find({ clerkId: { $in: clerkIds } });
    creators = JSON.parse(JSON.stringify(creatorDocs));
  }

  const creatorMap = new Map<
    string,
    { firstName?: string; lastName?: string; email?: string }
  >();

  for (const c of creators) {
    const clerkId = typeof c.clerkId === 'string' ? c.clerkId : undefined;
    if (!clerkId) continue;
    creatorMap.set(clerkId, {
      firstName:
        typeof c.firstName === 'string' && c.firstName.trim().length
          ? c.firstName
          : undefined,
      lastName:
        typeof c.lastName === 'string' && c.lastName.trim().length
          ? c.lastName
          : undefined,
      email:
        typeof c.email === 'string' && c.email.trim().length
          ? c.email
          : undefined,
    });
  }

  const enrichedTests = plainTests.map(t => {
    const createdBy =
      typeof t.createdBy === 'string' && t.createdBy.trim().length
        ? t.createdBy.trim()
        : undefined;
    const creator = createdBy ? creatorMap.get(createdBy) : undefined;
    const fullName =
      creator &&
      [creator.firstName, creator.lastName].filter(Boolean).join(' ').trim();

    const createdByDisplay =
      (fullName && fullName.length > 0) ||
      (creator?.email && creator.email.trim().length > 0)
        ? fullName || creator!.email!.trim()
        : createdBy || 'Deleted user';

    return {
      ...t,
      createdByDisplay,
    };
  });

  return enrichedTests as Array<{
    _id: string;
    title: string;
    subject: string;
    createdAt: Date;
    createdByDisplay: string;
    isPublished?: boolean;
    [key: string]: unknown;
  }>;
}

export async function getQuestions() {
  await dbConnect();
  const questions = await Question.find({}).sort({ createdAt: -1 }).limit(100); // Limit to 100 for now to avoid performance issues
  return JSON.parse(JSON.stringify(questions));
}

export async function getChallengesForAdmin() {
  await dbConnect();

  const tests = await Test.find({ openChallenge: true })
    .select('_id title createdBy')
    .sort({ createdAt: -1 })
    .lean();

  if (!tests.length) {
    return [];
  }

  const testIds = tests.map(t => t._id);

  const [results, creators] = await Promise.all([
    Result.find({ testId: { $in: testIds } })
      .select('_id testId createdAt')
      .sort({ createdAt: 1 })
      .lean(),
    User.find({ clerkId: { $in: tests.map(t => t.createdBy).filter(Boolean) } })
      .select('clerkId firstName lastName email')
      .lean(),
  ]);

  const firstResultByTestId = new Map<string, string>();
  for (const r of results) {
    const key = r.testId?.toString();
    if (!key || firstResultByTestId.has(key)) continue;
    firstResultByTestId.set(key, r._id.toString());
  }

  const creatorMap = new Map<string, { firstName?: string; lastName?: string; email?: string }>();
  for (const c of creators) {
    creatorMap.set(c.clerkId as string, {
      firstName: c.firstName as string | undefined,
      lastName: c.lastName as string | undefined,
      email: c.email as string | undefined,
    });
  }

  return tests.map(t => {
    const creator = creatorMap.get(t.createdBy as string);
    const fullName =
      creator &&
      [creator.firstName, creator.lastName].filter(Boolean).join(' ').trim();
    let creatorName: string;

    if (
      (fullName && fullName.length > 0) ||
      (creator?.email && creator.email.trim().length > 0)
    ) {
      creatorName = fullName || creator!.email!.trim();
    } else {
      creatorName = (t.createdBy as string) || 'Deleted user';
    }

    const testIdStr = t._id.toString();

    return {
      _id: testIdStr,
      title: (t.title as string) ?? 'Open Challenge',
      creatorName,
      sampleResultId: firstResultByTestId.get(testIdStr) ?? null,
    };
  });
}

export async function deleteUsers(userIds: string[]) {
  await dbConnect();
  if (!userIds?.length) return { error: 'No users selected' };
  const users = await User.find({ _id: { $in: userIds } }).lean();
  if (!users.length) return { error: 'No users found' };

  const nonAdminUsers = users.filter(u => u.role !== 'admin');
  const adminUsers = users.filter(u => u.role === 'admin');

  if (!nonAdminUsers.length) {
    return { error: 'Admin users cannot be deleted' };
  }

  const effectiveUserIds = nonAdminUsers.map(u => String(u._id));

  const clerkIds = nonAdminUsers
    .map(u => u.clerkId)
    .filter((id): id is string => Boolean(id));

  // Find all tests created by these users (including Open Challenge tests)
  const tests = clerkIds.length
    ? await Test.find({ createdBy: { $in: clerkIds } })
        .select('_id sections questions')
        .lean()
    : [];

  const testIds = tests.map(t => t._id);

  // Collect question ids referenced in tests (sections + deprecated questions array)
  const questionIdsFromTests: string[] = [];
  for (const test of tests) {
    const sectionList = (test as { sections?: unknown[] }).sections;
    if (Array.isArray(sectionList)) {
      for (const section of sectionList) {
        const qs = (section as { questions?: unknown[] }).questions;
        if (Array.isArray(qs)) {
          qs.forEach(qId => {
            if (qId) questionIdsFromTests.push(String(qId));
          });
        }
      }
    }
    const flatQuestions = (test as { questions?: unknown[] }).questions;
    if (Array.isArray(flatQuestions)) {
      flatQuestions.forEach(q => {
        const id =
          q && typeof q === 'object'
            ? (q as { _id?: unknown })._id
            : undefined;
        if (id) questionIdsFromTests.push(String(id));
      });
    }
  }

  // Delete results where the deleted users are students or where their tests are involved
  const resultConditions: any[] = [];
  if (clerkIds.length) {
    resultConditions.push({ studentId: { $in: clerkIds } });
  }
  if (testIds.length) {
    resultConditions.push({ testId: { $in: testIds } });
  }
  if (resultConditions.length) {
    await Result.deleteMany({ $or: resultConditions });
  }

  // Delete friends where deleted users are inviters, invitees, or related to their tests
  const friendConditions: any[] = [];
  if (clerkIds.length) {
    friendConditions.push({ addedBy: { $in: clerkIds } });
    friendConditions.push({ linkedClerkId: { $in: clerkIds } });
  }
  if (testIds.length) {
    friendConditions.push({ challengeTestId: { $in: testIds } });
  }
  if (friendConditions.length) {
    await Friend.deleteMany({ $or: friendConditions });
  }

  // Delete questions authored by these users or referenced by their tests
  const questionConditions: any[] = [];
  if (clerkIds.length) {
    questionConditions.push({ createdBy: { $in: clerkIds } });
  }
  if (questionIdsFromTests.length) {
    questionConditions.push({ _id: { $in: questionIdsFromTests } });
  }
  if (questionConditions.length) {
    await Question.deleteMany({ $or: questionConditions });
  }

  // Delete tests created by these users
  let deletedTests = 0;
  if (testIds.length) {
    const testResult = await Test.deleteMany({ _id: { $in: testIds } });
    deletedTests = testResult.deletedCount ?? 0;
  }

  // Finally delete the User records themselves
  const userResult = await User.deleteMany({ _id: { $in: effectiveUserIds } });

  // Attempt to remove users from Clerk so they can no longer sign in
  const failedClerkDeletes: string[] = [];
  if (clerkIds.length) {
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      await Promise.all(
        clerkIds.map(async clerkId => {
          try {
            await client.users.deleteUser(clerkId);
          } catch (err) {
            console.error('Failed to delete Clerk user', clerkId, err);
            failedClerkDeletes.push(clerkId);
          }
        })
      );
    } catch (err) {
      console.error('Failed to initialize Clerk client for user deletion', err);
    }
  }

  return {
    deletedUsers: userResult.deletedCount ?? 0,
    deletedTests,
    failedClerkDeletes: failedClerkDeletes.length ? failedClerkDeletes : undefined,
    skippedAdminUsers: adminUsers.length ? adminUsers.map(u => String(u._id)) : undefined,
  };
}

export async function getUserByIdWithFriends(userId: string) {
  await dbConnect();
  const user = await User.findById(userId).lean();
  if (!user) return null;
  const friendRecords = await Friend.find({ addedBy: user.clerkId })
    .sort({ createdAt: -1 })
    .lean();
  const linkedClerkIds = [
    ...new Set(
      friendRecords
        .map(f => f.linkedClerkId)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const linkedUsers =
    linkedClerkIds.length > 0
      ? await User.find({ clerkId: { $in: linkedClerkIds } }).lean()
      : [];
  const linkedUserMap = new Map(
    linkedUsers.map(u => [u.clerkId, u])
  );
  return {
    user: JSON.parse(JSON.stringify(user)),
    friends: JSON.parse(
      JSON.stringify(
        friendRecords.map(f => ({
          ...f,
          linkedUser: f.linkedClerkId
            ? linkedUserMap.get(f.linkedClerkId)
            : undefined,
        }))
      )
    ),
  };
}
