import type { Metadata } from 'next';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import { notFound, redirect } from 'next/navigation';
import TestTaker from '@/app/student/test/[id]/TestTaker';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();
  const test = await Test.findById(id).select('title').lean();
  return {
    title: test ? `${test.title} | ReWise` : 'Open Challenge | ReWise',
  };
}

export default async function OpenChallengeTestPage(props: Props) {
  const params = await props.params;
  const { userId } = await currentAuth();
  if (!userId) {
    redirect(
      `/sign-up?redirect_url=${encodeURIComponent('/open-challenge/test/' + params.id)}`
    );
  }

  const { id } = params;

  await dbConnect();
  const test = await Test.findById(id)
    .populate({
      path: 'sections.questions',
      model: Question,
    })
    .populate({
      path: 'questions',
      model: Question,
    })
    .lean();

  if (!test) {
    notFound();
  }

  if (!(test as { openChallenge?: boolean }).openChallenge) {
    redirect(`/student/test/${id}`);
  }

  const serializedTest = JSON.parse(JSON.stringify(test));

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <TestTaker
          test={serializedTest}
          userId={userId}
          resultBasePath="/open-challenge/result"
        />
      </div>
    </div>
  );
}
