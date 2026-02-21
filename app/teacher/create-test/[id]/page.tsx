import type { Metadata } from 'next';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import '@/lib/db/models/Question'; // Ensure model is registered for populate
import { notFound, redirect } from 'next/navigation';
import EditTestForm from './EditTestForm';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (id === 'new') {
    return { title: 'Create Test | ReWise' };
  }
  await dbConnect();
  const test = await Test.findById(id).select('title').lean();
  return {
    title: test ? `Edit: ${test.title} | ReWise` : 'Edit Test | ReWise',
  };
}

export default async function EditTestPage(props: Props) {
  const { id } = await props.params;

  if (id === 'new') {
    redirect('/teacher/create-test');
  }

  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  await dbConnect();

  const test = await Test.findOne({ _id: id, createdBy: userId }).populate(
    'sections.questions'
  );

  if (!test) {
    notFound();
  }

  const serialized = JSON.parse(JSON.stringify(test));

  return (
    <EditTestForm
      testId={id}
      initialData={{
        title: serialized.title,
        subject: serialized.subject,
        board: serialized.board,
        grade: serialized.grade,
        visibility: serialized.visibility,
        isTimed: serialized.isTimed,
        durationMinutes: serialized.durationMinutes,
        sections: serialized.sections,
        questions: serialized.questions,
      }}
    />
  );
}
