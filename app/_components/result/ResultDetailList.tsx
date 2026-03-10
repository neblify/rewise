'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { ITest, IQuestion } from '@/lib/db/models/Test';
import { PictureBasedFrame } from '@/components/PictureBasedFrame';
import { ImagePreviewModal } from '@/components/ImagePreviewModal';

interface ResultAnswer {
  questionId: string;
  answer?: string | number[];
  isCorrect?: boolean;
  marksObtained?: number;
  feedback?: string;
}

interface PopulatedResult {
  answers: ResultAnswer[];
}

function findQuestion(
  test: { sections?: { questions?: unknown[] }[]; questions?: unknown[] },
  id: string
): IQuestion | undefined {
  if (id.includes('-')) {
    const [sIndex, qIndex] = id.split('-').map(Number);
    const q = test.sections?.[sIndex]?.questions?.[qIndex];
    return q as IQuestion | undefined;
  }
  const q = (test.questions as IQuestion[] | undefined)?.[parseInt(id)];
  return q;
}

export function ResultDetailList({
  populatedResult,
  test,
}: {
  populatedResult: PopulatedResult;
  test: ITest & { _id: unknown; sections?: { questions?: unknown[] }[]; questions?: unknown[] };
}) {
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-6">
        {populatedResult.answers.map((ans: ResultAnswer, i: number) => {
          const question = findQuestion(test, ans.questionId);
          const qText = question ? question.text : `Question ${i + 1}`;
          const mediaUrl = question?.mediaUrl;

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

              {mediaUrl && (
                <div className="mt-2 mb-4">
                  <PictureBasedFrame
                    src={mediaUrl}
                    alt="Question image"
                    onClick={() => setImagePreviewSrc(mediaUrl)}
                  />
                </div>
              )}

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

      <ImagePreviewModal
        src={imagePreviewSrc}
        onClose={() => setImagePreviewSrc(null)}
        alt="Question image"
      />
    </>
  );
}
