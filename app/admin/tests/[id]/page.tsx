import type { Metadata } from 'next';
import dbConnect from '@/lib/db/connect';
import Test, { type ITest } from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';
import User from '@/lib/db/models/User';
import { notFound } from 'next/navigation';
import { AdminTestQuestionsList } from './AdminTestQuestionsList';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

interface AttemptEntry {
  id: string;
  studentId: string;
  name: string;
  emailLocalPart: string;
  attemptIndex: number;
  totalScore: number;
  maxScore: number;
  createdAt: Date;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();
  const test = await Test.findById(id).select('title').lean();
  return {
    title: test ? `${test.title} | Admin Test View | ReWise` : 'Admin Test View | ReWise',
  };
}

export default async function AdminTestDetailPage(props: Props) {
  const params = await props.params;
  const { id } = params;

  await dbConnect();

  const testDoc = await Test.findById(id)
    .populate({
      path: 'sections.questions',
      model: Question,
    })
    .populate({
      path: 'questions',
      model: Question,
    })
    .lean();

  if (!testDoc) {
    notFound();
  }

  const test = testDoc as ITest & {
    _id: unknown;
    openChallenge?: boolean;
  };

  // Only regular tests (non-openChallenge) should be visible here
  if (test.openChallenge) {
    notFound();
  }

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

  let attempts: AttemptEntry[] = allResults.map((r, attemptIndex) => {
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

  // Sort primarily by creation time (earlier first); you can adjust if you prefer score-based
  attempts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const sections = (test.sections ?? []).map(section => {
    const questions = (section.questions ?? []) as Array<
      typeof Question & {
        _id?: unknown;
        text?: unknown;
        type?: unknown;
        options?: unknown;
        leftColumn?: unknown;
        correctAnswer?: unknown;
        marks?: unknown;
      }
    >;
    return {
      title: section.title,
      description: section.description,
      questions: questions.map(q => ({
        id: String((q as { _id?: unknown })._id ?? ''),
        text: String((q as { text?: unknown }).text ?? ''),
        type: String((q as { type?: unknown }).type ?? ''),
        options: Array.isArray((q as { options?: unknown }).options)
          ? ((q as { options?: string[] }).options ?? [])
          : [],
        leftColumn: Array.isArray((q as { leftColumn?: unknown }).leftColumn)
          ? ((q as { leftColumn?: string[] }).leftColumn ?? [])
          : [],
        correctAnswer: (q as { correctAnswer?: unknown }).correctAnswer,
        marks:
          typeof (q as { marks?: unknown }).marks === 'number'
            ? (q as { marks: number }).marks
            : 1,
        mediaUrl: typeof (q as { mediaUrl?: string }).mediaUrl === 'string' ? (q as unknown as { mediaUrl: string }).mediaUrl : undefined,
      })),
    };
  });

  const flatQuestions =
    !sections.length && Array.isArray(test.questions)
      ? (test.questions as Array<{
          _id?: unknown;
          text?: unknown;
          type?: unknown;
          options?: string[];
          leftColumn?: string[];
          correctAnswer?: unknown;
          marks?: number;
          mediaUrl?: string;
        }>)
      : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{test.title}</h1>
        <p className="mt-1 text-muted-foreground">
          Subject: {test.subject}
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Questions and Correct Answers
        </h2>

        <AdminTestQuestionsList
          sections={sections}
          flatQuestions={flatQuestions}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Test Attempts
        </h2>

        {attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No students have attempted this test yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-background">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Name / Handle
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Score
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Attempt
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.map((entry, index) => {
                  const percentage =
                    entry.maxScore > 0
                      ? Math.round((entry.totalScore / entry.maxScore) * 100)
                      : 0;
                  const displayName =
                    entry.name && entry.name.length > 0
                      ? entry.name
                      : entry.emailLocalPart || 'Anonymous';

                  return (
                    <tr key={entry.id}>
                      <td className="px-4 py-2 text-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        {displayName}
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        {entry.totalScore} / {entry.maxScore} ({percentage}
                        %)
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        #{entry.attemptIndex + 1}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {entry.createdAt.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

