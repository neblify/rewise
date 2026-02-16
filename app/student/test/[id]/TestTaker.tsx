'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ITest, IQuestion } from '@/lib/db/models/Test';
import { submitTest } from './actions';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

function MatchColumnQuestion({
  leftColumn,
  rightColumn,
  value,
  onChange,
}: {
  leftColumn: string[];
  rightColumn: string[];
  value: number[];
  onChange: (val: number[]) => void;
}) {
  const [draggedRightIndex, setDraggedRightIndex] = useState<number | null>(
    null
  );
  const getMapping = useCallback(
    (leftIdx: number) => (leftIdx < value.length ? value[leftIdx] : -1),
    [value]
  );
  const setMapping = useCallback(
    (leftIdx: number, rightIdx: number) => {
      const arr = [...value];
      while (arr.length <= leftIdx) arr.push(-1);
      arr[leftIdx] = rightIdx;
      onChange(arr);
    },
    [value, onChange]
  );

  if (!leftColumn.length || !rightColumn.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No column items defined for this question.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Drag an item from Column B onto a row in Column A, or use the dropdown.
      </p>
      <div className="flex flex-col gap-2">
        {leftColumn.map((leftItem, leftIdx) => (
          <div
            key={leftIdx}
            className={cn(
              'flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-background/50 min-h-12',
              draggedRightIndex !== null &&
                getMapping(leftIdx) === -1 &&
                'border-dashed border-primary/30'
            )}
            onDragOver={e => {
              e.preventDefault();
              e.currentTarget.classList.add('ring-2', 'ring-primary/20');
            }}
            onDragLeave={e => {
              e.currentTarget.classList.remove('ring-2', 'ring-primary/20');
            }}
            onDrop={e => {
              e.preventDefault();
              e.currentTarget.classList.remove('ring-2', 'ring-primary/20');
              const fromState = draggedRightIndex;
              const fromData = e.dataTransfer.getData('text/plain');
              const rightIdx =
                typeof fromState === 'number'
                  ? fromState
                  : fromData !== ''
                    ? parseInt(fromData, 10)
                    : NaN;
              setDraggedRightIndex(null);
              if (!Number.isNaN(rightIdx) && rightIdx >= 0)
                setMapping(leftIdx, rightIdx);
            }}
          >
            <span className="font-medium text-foreground flex-shrink-0 min-w-[120px]">
              {leftItem || `Item ${leftIdx + 1}`}
            </span>
            <span className="text-muted-foreground">→</span>
            <select
              value={getMapping(leftIdx) >= 0 ? getMapping(leftIdx) : ''}
              onChange={e =>
                setMapping(
                  leftIdx,
                  e.target.value === '' ? -1 : parseInt(e.target.value, 10)
                )
              }
              className="rounded-md border border-border px-2 py-1.5 text-sm bg-card text-foreground focus:border-primary focus:ring-primary"
            >
              <option value="">Select match...</option>
              {rightColumn.map((opt, ri) => (
                <option key={ri} value={ri}>
                  {opt || `Option ${ri + 1}`}
                </option>
              ))}
            </select>
            {getMapping(leftIdx) >= 0 && (
              <span className="text-sm text-muted-foreground">
                {rightColumn[getMapping(leftIdx)]}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Column B (drag from here)
        </span>
        <div className="flex flex-wrap gap-2 mt-1">
          {rightColumn.map((opt, ri) => (
            <span
              key={ri}
              draggable
              onDragStart={e => {
                setDraggedRightIndex(ri);
                e.dataTransfer.setData('text/plain', String(ri));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => setDraggedRightIndex(null)}
              className={cn(
                'inline-block px-3 py-1.5 rounded-md border text-sm cursor-grab active:cursor-grabbing bg-card border-border text-foreground hover:border-primary/30',
                draggedRightIndex === ri && 'opacity-50'
              )}
            >
              {opt || `Option ${ri + 1}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TestTaker({
  test,
  userId,
}: {
  test: ITest;
  userId: string;
}) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const totalSeconds =
    (test.isTimed && test.durationMinutes ? test.durationMinutes * 60 : 0) + 5;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const answersRef = useRef(answers);
  const hasAutoSubmitted = useRef(false);
  const setSubmittingRef = useRef(setIsSubmitting);
  answersRef.current = answers;
  setSubmittingRef.current = setIsSubmitting;

  useEffect(() => {
    if (!test.isTimed || totalSeconds <= 0) return;
    const id = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          if (!hasAutoSubmitted.current) {
            hasAutoSubmitted.current = true;
            setSubmittingRef.current(true);
            submitTest(test._id as unknown as string, answersRef.current)
              .then(result => {
                if (result && 'success' in result && result.success) {
                  router.push(`/student/result/${result.resultId}`);
                } else {
                  setSubmittingRef.current(false);
                  alert(
                    'Failed to submit: ' + (result?.message || 'Unknown error')
                  );
                }
              })
              .catch(() => {
                setSubmittingRef.current(false);
                alert('Failed to submit test');
              });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [test.isTimed, test._id, totalSeconds, router]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit the test?')) return;

    setIsSubmitting(true);
    try {
      const result = await submitTest(test._id as unknown as string, answers);
      if (result && 'success' in result && result.success) {
        router.push(`/student/result/${result.resultId}`);
      } else {
        alert('Failed to submit test: ' + (result?.message || 'Unknown error'));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test');
      setIsSubmitting(false);
    }
  };

  // Helper to render a single question
  const renderQuestion = (q: IQuestion, qIndex: number, uniqueId: string) => (
    <div
      key={uniqueId}
      className="bg-card rounded-xl p-6 shadow-sm border border-border mb-4"
    >
      <div className="flex gap-4">
        <span className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-violet-light text-primary font-bold text-sm">
          {qIndex + 1}
        </span>
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex justify-between items-start">
              <p className="text-lg font-medium text-foreground">{q.text}</p>
              <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded">
                {q.marks} Marks
              </span>
            </div>
            {q.mediaUrl && (
              <img
                src={q.mediaUrl}
                alt="Question Image"
                className="mt-4 rounded-lg max-h-64 object-cover"
              />
            )}
          </div>

          {/* Render Input based on Type */}
          {q.type === 'mcq' && (
            <div className="space-y-2">
              {q.options?.map((opt, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors"
                >
                  <input
                    type="radio"
                    name={`q-${uniqueId}`}
                    value={opt}
                    checked={answers[uniqueId] === opt}
                    onChange={e => handleAnswerChange(uniqueId, e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'true_false' && (
            <div className="flex gap-4">
              {['True', 'False'].map(opt => (
                <label
                  key={opt}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors"
                >
                  <input
                    type="radio"
                    name={`q-${uniqueId}`}
                    value={opt}
                    checked={answers[uniqueId] === opt}
                    onChange={e => handleAnswerChange(uniqueId, e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {[
            'fill_in_blanks',
            'single_word',
            'one_sentence',
            'brief_answer',
            'picture_based',
            'difference',
          ].includes(q.type) && (
            <textarea
              value={answers[uniqueId] || ''}
              onChange={e => handleAnswerChange(uniqueId, e.target.value)}
              className="block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              rows={
                q.type === 'brief_answer' || q.type === 'difference' ? 4 : 1
              }
              placeholder="Type your answer here..."
            />
          )}

          {q.type === 'match_columns' && (
            <MatchColumnQuestion
              leftColumn={Array.isArray(q.leftColumn) ? q.leftColumn : []}
              rightColumn={Array.isArray(q.options) ? q.options : []}
              value={(answers[uniqueId] as number[] | undefined) ?? []}
              onChange={val => handleAnswerChange(uniqueId, val)}
            />
          )}
        </div>
      </div>
    </div>
  );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {test.isTimed && totalSeconds > 0 && (
        <div
          className={cn(
            'sticky top-0 z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border font-mono text-lg font-semibold',
            remainingSeconds <= 60
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          )}
        >
          <Clock className="h-5 w-5" />
          <span>{formatTime(remainingSeconds)}</span>
        </div>
      )}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h1 className="text-2xl font-bold text-foreground">{test.title}</h1>
        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
          <span>{test.subject}</span>
          <span>•</span>
          <span>{test.board || 'Standard'} Board</span>
          <span>•</span>
          <span>Grade {test.grade || 'N/A'}</span>
        </div>
      </div>

      <div className="space-y-8">
        {test.sections?.map((section, sIndex) => (
          <div key={sIndex} className="space-y-4">
            <div className="flex items-baseline gap-2 border-b border-border pb-2">
              <h2 className="text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              {section.description && (
                <span className="text-sm text-muted-foreground">
                  {section.description}
                </span>
              )}
            </div>

            {section.questions.map((q, qIndex) =>
              renderQuestion(q as IQuestion, qIndex, `${sIndex}-${qIndex}`)
            )}
          </div>
        ))}

        {/* Fallback for legacy tests with flat questions */}
        {(!test.sections || test.sections.length === 0) &&
          test.questions?.map((q, index) =>
            renderQuestion(q as IQuestion, index, index.toString())
          )}

        <div className="flex justify-end pt-8 pb-20">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-md gradient-primary px-8 py-3 text-base font-medium text-white shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
