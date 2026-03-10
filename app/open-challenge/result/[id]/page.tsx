import type { Metadata } from 'next';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Result from '@/lib/db/models/Result';
import User from '@/lib/db/models/User';
import { getDashboardHref, getRole } from '@/lib/role';
import { notFound, redirect } from 'next/navigation';
import { ITest } from '@/lib/db/models/Test';
import { ResultView } from '@/app/_components/result/ResultView';

interface ResultAnswer {
  questionId: string;
  answer?: string | number[];
  isCorrect?: boolean;
  marksObtained?: number;
  feedback?: string;
}

interface PopulatedResult {
  _id: string;
  testId: ITest;
  studentId: string;
  answers: ResultAnswer[];
  totalScore: number;
  maxScore: number;
  aiFeedback?: string;
  weakAreas?: string[];
  createdAt: Date;
}

interface ChallengeEntry {
  id: string;
  studentId: string;
  name: string;
  emailLocalPart: string;
  attemptIndex: number;
  totalScore: number;
  maxScore: number;
  createdAt: Date;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();
  const result = await Result.findById(id).populate('testId', 'title').lean();
  const title = (result?.testId as { title?: string } | undefined)?.title;
  return {
    title: title ? `${title} Result | ReWise` : 'Open Challenge Result | ReWise',
  };
}

export default async function OpenChallengeResultPage(props: Props) {
  const params = await props.params;
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  const role = await getRole(userId);
  const dashboardHref = getDashboardHref(role);

  const { id } = params;

  await dbConnect();
  const rawResult = await Result.findById(id)
    .populate({
      path: 'testId',
      populate: [
        { path: 'sections.questions' },
        { path: 'questions' },
      ],
    })
    .lean();

  if (!rawResult) notFound();

  // Fully serialize to plain JSON to avoid Mongoose prototypes / circular refs
  const populatedResult = JSON.parse(
    JSON.stringify(rawResult)
  ) as unknown as PopulatedResult;
  const test = populatedResult.testId as ITest & {
    _id: unknown;
    openChallenge?: boolean;
    createdBy?: string;
  };

  if (!test.openChallenge) {
    redirect(`/student/result/${id}`);
  }

  let challengeResults: ChallengeEntry[] = [];

  const allResults = await Result.find({ testId: test._id })
    .sort({ createdAt: 1 })
    .lean();

  const clerkIds = Array.from(
    new Set(allResults.map(r => r.studentId).filter(Boolean))
  );

  const users =
    clerkIds.length > 0
      ? await User.find({ clerkId: { $in: clerkIds } })
          .select('clerkId firstName lastName email')
          .lean()
      : [];

  const userByClerkId = new Map(
    users.map(u => [
      u.clerkId as string,
      u as { firstName?: string; lastName?: string; email?: string },
    ])
  );

  challengeResults = allResults.map((r, attemptIndex) => {
    const user = userByClerkId.get(r.studentId as string);
    const fullName = user
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : '';
    const email = user?.email?.trim() ?? '';
    const emailLocalPart = email.includes('@')
      ? email.split('@')[0]
      : email || '';

    return {
      id: r._id.toString(),
      studentId: r.studentId as string,
      name: fullName,
      emailLocalPart,
      attemptIndex,
      totalScore: r.totalScore,
      maxScore: r.maxScore,
      createdAt: r.createdAt,
    };
  });

  challengeResults.sort((a, b) => {
    const percA = a.maxScore > 0 ? a.totalScore / a.maxScore : 0;
    const percB = b.maxScore > 0 ? b.totalScore / b.maxScore : 0;
    if (percA !== percB) return percB - percA;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return (
    <ResultView
      populatedResult={populatedResult}
      test={test}
      challengeResults={challengeResults}
      userId={userId}
      dashboardHref={dashboardHref}
      backToOpenChallenge
    />
  );
}
