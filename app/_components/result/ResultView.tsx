import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { ITest, IQuestion } from '@/lib/db/models/Test';

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

interface ResultViewProps {
  populatedResult: PopulatedResult;
  test: ITest & { _id: unknown; openChallenge?: boolean; createdBy?: string };
  challengeResults: ChallengeEntry[];
  userId: string;
  dashboardHref: string;
  backToOpenChallenge?: boolean;
}

function findQuestion(
  test: ResultViewProps['test'],
  id: string
): IQuestion | undefined {
  if (id.includes('-')) {
    const [sIndex, qIndex] = id.split('-').map(Number);
    return (test.sections?.[sIndex]?.questions as IQuestion[] | undefined)?.[
      qIndex
    ];
  }
  return (test.questions as IQuestion[] | undefined)?.[parseInt(id)];
}

export function ResultView({
  populatedResult,
  test,
  challengeResults,
  userId,
  dashboardHref,
  backToOpenChallenge = false,
}: ResultViewProps) {
  const percentage =
    populatedResult.maxScore > 0
      ? Math.round(
          (populatedResult.totalScore / populatedResult.maxScore) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {backToOpenChallenge && (
          <Link
            href="/open-challenge"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Open Challenge
          </Link>
        )}

        {/* Header / Score Card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="gradient-primary p-8 text-white text-center">
            <h1 className="text-3xl font-bold">{test.title}</h1>
            <p className="opacity-90">{test.subject} • Result Analysis</p>

            <div className="mt-8 flex justify-center items-end gap-2">
              <span className="text-6xl font-extrabold">{percentage}%</span>
              <span className="text-xl opacity-80 mb-2">Score</span>
            </div>
            <p className="mt-2 text-white/70">
              {populatedResult.totalScore} / {populatedResult.maxScore} Marks
            </p>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="p-1 rounded bg-violet-light text-primary">
                  ✨
                </span>
                AI Feedback
              </h3>
              <p className="text-muted-foreground leading-relaxed bg-background p-4 rounded-xl border border-border">
                {populatedResult.aiFeedback || 'No feedback generated.'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="p-1 rounded bg-orange-100 text-orange-600">
                  ⚠️
                </span>
                Weak Areas
              </h3>
              {populatedResult.weakAreas &&
              populatedResult.weakAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {populatedResult.weakAreas.map((area: string) => (
                    <span
                      key={area}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  None identified. Great job!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            Detailed Analysis
          </h2>

          {populatedResult.answers.map((ans: ResultAnswer, i: number) => {
            const question = findQuestion(test, ans.questionId);
            const qText = question ? question.text : `Question ${i + 1}`;

            return (
              <div
                key={ans.questionId}
                className={`bg-card rounded-xl p-6 shadow-sm border-l-4 ${ans.isCorrect ? 'border-green-500' : 'border-red-500'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    {qText}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
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
                  <div className="bg-background p-3 rounded-lg">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Your Answer
                    </span>
                    <p className="text-foreground font-medium">
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
                  <div className="mt-4 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-100">
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

        {test.openChallenge &&
          challengeResults.length > 0 &&
          (() => {
            const inviterClerkId = test.createdBy;
            const isInviter = inviterClerkId === userId;
            const currentEntry = challengeResults.find(
              e => e.id === populatedResult._id.toString()
            );
            const currentAttemptIndex = currentEntry?.attemptIndex ?? -1;

            return (
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Challenge Leaderboard
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Everyone who has attempted this Open Challenge can see these
                  scores.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-3 py-2 font-medium text-foreground">
                          #
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-foreground">
                          Challenger
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-foreground">
                          Score
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-foreground">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {challengeResults.map((entry, index) => {
                        const isCurrent =
                          entry.id === populatedResult._id.toString();
                        const pct =
                          entry.maxScore > 0
                            ? Math.round(
                                (entry.totalScore / entry.maxScore) * 100
                              )
                            : 0;

                        const showName =
                          isInviter ||
                          isCurrent ||
                          entry.attemptIndex < currentAttemptIndex ||
                          entry.attemptIndex > currentAttemptIndex;
                        const displayLabel = showName
                          ? (entry.name || entry.emailLocalPart || 'Challenger')
                          : 'Challenger';

                        return (
                          <tr
                            key={entry.id}
                            className={`border-b border-border last:border-0 ${
                              isCurrent ? 'bg-violet-50/70' : ''
                            }`}
                          >
                            <td className="px-3 py-2 text-foreground">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {displayLabel}
                              {isCurrent && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                  You
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {entry.totalScore} / {entry.maxScore}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

        <div className="flex flex-wrap justify-center gap-4 pt-8">
          {test.openChallenge && (
            <Link
              href="/open-challenge"
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              Invite friends to beat your score
            </Link>
          )}
          <Link
            href={dashboardHref}
            className="px-6 py-3 gradient-primary text-white rounded-lg hover:brightness-110 transition-colors font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
