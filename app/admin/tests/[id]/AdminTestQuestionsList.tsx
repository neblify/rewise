'use client';

import { useState } from 'react';
import { PictureBasedFrame } from '@/components/PictureBasedFrame';
import { ImagePreviewModal } from '@/components/ImagePreviewModal';

interface SectionQuestion {
  id: string;
  text: string;
  type: string;
  options: string[];
  leftColumn: string[];
  correctAnswer: unknown;
  marks: number;
  mediaUrl?: string;
}

interface Section {
  title: string;
  description?: string;
  questions: SectionQuestion[];
}

interface FlatQuestion {
  _id?: unknown;
  text?: unknown;
  type?: unknown;
  options?: string[];
  leftColumn?: string[];
  correctAnswer?: unknown;
  marks?: number;
  mediaUrl?: string;
}

export function AdminTestQuestionsList({
  sections,
  flatQuestions,
}: {
  sections: Section[];
  flatQuestions: FlatQuestion[];
}) {
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string | null>(null);

  const renderQuestionContent = (q: SectionQuestion, index: number) => {
    const isMatchColumns =
      q.type === 'match_columns' &&
      q.leftColumn.length > 0 &&
      q.options.length > 0;

    let mappedRightColumn: string[] | null = null;
    if (isMatchColumns && Array.isArray(q.correctAnswer)) {
      const answerIndices = q.correctAnswer as number[];
      mappedRightColumn = q.leftColumn.map((_, idx) => {
        const optIndex = answerIndices[idx];
        if (typeof optIndex === 'number' && optIndex >= 0 && optIndex < q.options.length) {
          return q.options[optIndex];
        }
        return '';
      });
    }

    return (
      <>
        <div className="text-sm font-medium text-foreground">{q.text}</div>
        <div className="text-xs uppercase text-muted-foreground">
          Type: {q.type.replace(/_/g, ' ')} · Marks: {q.marks}
        </div>

        {q.type === 'picture_based' && q.mediaUrl && (
          <div className="mt-2">
            <PictureBasedFrame
              src={q.mediaUrl}
              alt="Question image"
              onClick={() => setImagePreviewSrc(q.mediaUrl ?? null)}
            />
          </div>
        )}

        {isMatchColumns && mappedRightColumn ? (
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Column A (Question keys)</p>
              <ul className="mt-1 space-y-1 text-sm">
                {q.leftColumn.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Column B (Correct answers)</p>
              <ul className="mt-1 space-y-1 text-sm">
                {mappedRightColumn.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : q.leftColumn.length > 0 && q.options.length > 0 ? (
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Left column</p>
              <ul className="mt-1 space-y-1 text-sm">
                {q.leftColumn.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Right column</p>
              <ul className="mt-1 space-y-1 text-sm">
                {q.options.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {q.options.length > 0 && q.leftColumn.length === 0 ? (
          <ul className="mt-2 space-y-1 text-sm">
            {q.options.map((opt, idx) => {
              const isCorrectIndexArray =
                Array.isArray(q.correctAnswer) &&
                typeof (q.correctAnswer as number[])?.[0] === 'number' &&
                (q.correctAnswer as number[]).includes(idx);
              const isCorrectString =
                typeof q.correctAnswer === 'string' && q.correctAnswer === opt;
              const isCorrectStringArray =
                Array.isArray(q.correctAnswer) &&
                typeof (q.correctAnswer as string[])?.[0] === 'string' &&
                (q.correctAnswer as string[]).includes(opt);
              const highlight =
                isCorrectIndexArray || isCorrectString || isCorrectStringArray;
              return (
                <li
                  key={idx}
                  className={`px-2 py-1 rounded ${highlight ? 'bg-green-50 text-green-800' : 'text-foreground'}`}
                >
                  {opt}
                  {highlight ? (
                    <span className="ml-2 text-xs font-semibold uppercase">(Correct)</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {q.options.length === 0 && q.leftColumn.length === 0 ? (
          <div className="mt-2 text-sm">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Correct answer:{' '}
            </span>
            <span className="text-foreground">
              {Array.isArray(q.correctAnswer)
                ? (q.correctAnswer as unknown[]).map(v => String(v)).join(', ')
                : q.correctAnswer != null
                  ? String(q.correctAnswer)
                  : 'Not specified'}
            </span>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <>
      {sections.length > 0 ? (
        sections.map((section, sectionIndex) => (
          <div
            key={`${sectionIndex}-${section.title}`}
            className="rounded-lg border border-border bg-card p-4 space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              {section.description ? (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              ) : null}
            </div>
            <ol className="space-y-4 list-decimal list-inside">
              {section.questions.map((q, index) => (
                <li key={q.id || index} className="space-y-2">
                  {renderQuestionContent(q, index)}
                </li>
              ))}
            </ol>
          </div>
        ))
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          {flatQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions found for this test.</p>
          ) : (
            <ol className="space-y-4 list-decimal list-inside">
              {flatQuestions.map((q, index) => {
                const leftColumn = Array.isArray(q.leftColumn) ? q.leftColumn : [];
                const options = Array.isArray(q.options) ? q.options : [];
                const typeString = String(q.type ?? '');
                const isMatchColumns =
                  typeString === 'match_columns' &&
                  leftColumn.length > 0 &&
                  options.length > 0;

                let mappedRightColumn: string[] | null = null;
                if (isMatchColumns && Array.isArray(q.correctAnswer)) {
                  const answerIndices = q.correctAnswer as number[];
                  mappedRightColumn = leftColumn.map((_, idx) => {
                    const optIndex = answerIndices[idx];
                    if (
                      typeof optIndex === 'number' &&
                      optIndex >= 0 &&
                      optIndex < options.length
                    ) {
                      return options[optIndex];
                    }
                    return '';
                  });
                }

                const mediaUrl =
                  typeof q.mediaUrl === 'string' ? q.mediaUrl : undefined;

                return (
                  <li key={String(q._id) || index} className="space-y-2">
                    <div className="text-sm font-medium text-foreground">
                      {String(q.text ?? '')}
                    </div>
                    <div className="text-xs uppercase text-muted-foreground">
                      Type: {typeString.toLowerCase().replace(/_/g, ' ')} · Marks:{' '}
                      {typeof q.marks === 'number' ? q.marks : 1}
                    </div>

                    {typeString === 'picture_based' && mediaUrl && (
                      <div className="mt-2">
                        <PictureBasedFrame
                          src={mediaUrl}
                          alt="Question image"
                          onClick={() => setImagePreviewSrc(mediaUrl)}
                        />
                      </div>
                    )}

                    {isMatchColumns && mappedRightColumn ? (
                      <div className="mt-2 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">
                            Column A (Question keys)
                          </p>
                          <ul className="mt-1 space-y-1 text-sm">
                            {leftColumn.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">
                            Column B (Correct answers)
                          </p>
                          <ul className="mt-1 space-y-1 text-sm">
                            {mappedRightColumn.map((opt, idx) => (
                              <li key={idx}>{opt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : options.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm">
                        {options.map((opt, idx) => (
                          <li key={idx}>{opt}</li>
                        ))}
                      </ul>
                    ) : null}

                    {!isMatchColumns && (
                      <div className="mt-2 text-sm">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          Correct answer:{' '}
                        </span>
                        <span className="text-foreground">
                          {Array.isArray(q.correctAnswer)
                            ? (q.correctAnswer as unknown[]).map(v => String(v)).join(', ')
                            : q.correctAnswer != null
                              ? String(q.correctAnswer)
                              : 'Not specified'}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      <ImagePreviewModal
        src={imagePreviewSrc}
        onClose={() => setImagePreviewSrc(null)}
        alt="Question image"
      />
    </>
  );
}
