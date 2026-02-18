'use client';

import { useState, useTransition } from 'react';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionType } from '@/lib/constants/question-types';
import { BOARDS } from '@/lib/constants/boards';
import { getGradesForBoard } from '@/lib/constants/levels';
import { updateQuestion } from '../actions';

interface QuestionData {
  _id: string;
  text: string;
  type: string;
  options?: string[];
  correctAnswer?: string | string[];
  marks: number;
  subject?: string;
  board?: string;
  grade?: string;
  topic?: string;
  difficulty?: string;
  tags?: string[];
}

interface EditQuestionButtonProps {
  question: QuestionData;
  canEdit: boolean;
}

export default function EditQuestionButton({
  question,
  canEdit,
}: EditQuestionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState(question.text);
  const [type, setType] = useState(question.type);
  const [options, setOptions] = useState<string[]>(
    question.options || ['', '', '', '']
  );
  const [correctAnswer, setCorrectAnswer] = useState(
    Array.isArray(question.correctAnswer)
      ? question.correctAnswer.join(', ')
      : question.correctAnswer || ''
  );
  const [marks, setMarks] = useState(question.marks);
  const [subject, setSubject] = useState(question.subject || '');
  const [board, setBoard] = useState(question.board || '');
  const [grade, setGrade] = useState(question.grade || '');
  const [topic, setTopic] = useState(question.topic || '');
  const [difficulty, setDifficulty] = useState(question.difficulty || 'medium');
  const [tags, setTags] = useState(question.tags?.join(', ') || '');

  const gradeOptions = board ? getGradesForBoard(board) : [];

  const handleBoardChange = (newBoard: string) => {
    setBoard(newBoard);
    if (newBoard !== board) {
      const validGrades = getGradesForBoard(newBoard).map(g => g.value);
      if (!validGrades.includes(grade)) {
        setGrade('');
      }
    }
  };

  if (!canEdit) return null;

  const handleSave = () => {
    setError(null);
    const formData = new FormData();
    const data = {
      questionId: question._id,
      text,
      type,
      options: type === QuestionType.MCQ ? options.filter(Boolean) : undefined,
      correctAnswer: correctAnswer || undefined,
      marks,
      subject: subject || undefined,
      board: board || undefined,
      grade: grade || undefined,
      topic: topic || undefined,
      difficulty: difficulty || undefined,
      tags: tags
        ? tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        : undefined,
    };
    formData.set('data', JSON.stringify(data));

    startTransition(async () => {
      const result = await updateQuestion(null, formData);
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="text-primary hover:text-primary/90 hover:bg-violet-light font-medium"
      >
        <Pencil className="h-3.5 w-3.5 mr-1" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="text">Question Text</Label>
              <textarea
                id="text"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary h-10"
                >
                  {Object.values(QuestionType).map(t => (
                    <option key={t} value={t}>
                      {t
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min={1}
                  value={marks}
                  onChange={e => setMarks(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            {type === QuestionType.MCQ && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2 mt-1">
                  {options.map((opt, i) => (
                    <Input
                      key={i}
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => {
                        const next = [...options];
                        next[i] = e.target.value;
                        setOptions(next);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Input
                id="correctAnswer"
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="board">Board</Label>
                <select
                  id="board"
                  value={board}
                  onChange={e => handleBoardChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary h-10"
                >
                  <option value="">Select Board</option>
                  {BOARDS.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="grade">Grade</Label>
                <select
                  id="grade"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary h-10"
                  disabled={!board}
                >
                  <option value="">Select Grade</option>
                  {gradeOptions.map(g => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary h-10"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g. algebra, chapter-1, important"
                className="mt-1"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              variant="gradient"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
