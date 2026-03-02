import type { Metadata } from 'next';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Result from '@/lib/db/models/Result';
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
    title: title ? `${title} Result | ReWise` : 'Test Result | ReWise',
  };
}

export default async function ResultPage(props: Props) {
  const params = await props.params;
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  const role = await getRole(userId);
  const dashboardHref = getDashboardHref(role);

  const { id } = params;

  await dbConnect();
  const result = await Result.findById(id).populate({
    path: 'testId',
    populate: [
      {
        path: 'sections.questions',
      },
      {
        path: 'questions',
      },
    ],
  });

  if (!result) notFound();

  const populatedResult = result as unknown as PopulatedResult;
  const test = populatedResult.testId;
  if ((test as { openChallenge?: boolean }).openChallenge) {
    redirect(`/open-challenge/result/${id}`);
  }

  return (
    <ResultView
      populatedResult={populatedResult}
      test={test as ITest & { _id: unknown; openChallenge?: boolean; createdBy?: string }}
      challengeResults={[]}
      userId={userId}
      dashboardHref={dashboardHref}
    />
  );
}
