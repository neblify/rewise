import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Result from '@/lib/db/models/Result';
import Test from '@/lib/db/models/Test';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResultPage(props: Props) {
  const params = await props.params;
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;

  await dbConnect();
  // @ts-ignore
  const result: any = await Result.findById(id).populate({
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

  const test = result.testId;
  const percentage =
    result.maxScore > 0
      ? Math.round((result.totalScore / result.maxScore) * 100)
      : 0;

  // Helper to find question text by ID (which is "sIndex-qIndex" or just "index")
  const findQuestion = (id: string) => {
    if (id.includes('-')) {
      const [sIndex, qIndex] = id.split('-').map(Number);
      return test.sections?.[sIndex]?.questions?.[qIndex];
    } else {
      return test.questions?.[parseInt(id)];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header / Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold">{test.title}</h1>
            <p className="opacity-90">{test.subject} • Result Analysis</p>

            <div className="mt-8 flex justify-center items-end gap-2">
              <span className="text-6xl font-extrabold">{percentage}%</span>
              <span className="text-xl opacity-80 mb-2">Score</span>
            </div>
            <p className="mt-2 text-indigo-100">
              {result.totalScore} / {result.maxScore} Marks
            </p>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-100 text-indigo-600">
                  ✨
                </span>
                AI Feedback
              </h3>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                {result.aiFeedback || 'No feedback generated.'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="p-1 rounded bg-orange-100 text-orange-600">
                  ⚠️
                </span>
                Weak Areas
              </h3>
              {result.weakAreas && result.weakAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.weakAreas.map((area: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  None identified. Great job!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Detailed Analysis
          </h2>

          {result.answers.map((ans: any, i: number) => {
            const question = findQuestion(ans.questionId);
            const qText = question ? question.text : `Question ${i + 1}`;

            return (
              <div
                key={i}
                className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${ans.isCorrect ? 'border-green-500' : 'border-red-500'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{qText}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {ans.marksObtained} / {question?.marks || 1}
                    </span>
                    {ans.isCorrect ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <XCircle className="text-red-500 h-5 w-5" />
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Your Answer
                    </span>
                    <p className="text-gray-800 font-medium">
                      {ans.answer?.toString() || 'Skipped'}
                    </p>
                  </div>
                  {!ans.isCorrect && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="block text-xs uppercase tracking-wide text-green-700 mb-1 opacity-70">
                        Correct Answer / Model
                      </span>
                      <p className="text-green-800 font-medium">
                        {question?.correctAnswer?.toString() || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>

                {ans.feedback && (
                  <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <span className="font-semibold text-blue-700">
                      Feedback:{' '}
                    </span>
                    {ans.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-8">
          <Link
            href="/student"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
