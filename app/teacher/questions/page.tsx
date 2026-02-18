import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Question from '@/lib/db/models/Question';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { isAdmin } from '@/lib/auth/isAdmin';
import EditQuestionButton from './components/EditQuestionButton';
import DeleteQuestionButton from './components/DeleteQuestionButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{
    query?: string;
    subject?: string;
    board?: string;
    grade?: string;
    type?: string;
    sort?: string;
  }>;
}

function formatGrade(board?: string, grade?: string) {
  if (!grade) return '';
  return board === 'NIOS' ? `Level ${grade}` : `Class ${grade}`;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

export default async function QuestionBankPage(props: Props) {
  const searchParams = await props.searchParams;
  const { userId } = await currentAuth();

  if (!userId) {
    redirect('/');
  }

  await dbConnect();

  const admin = await isAdmin(userId);

  const query = searchParams.query || '';
  const subject = searchParams.subject || '';
  const board = searchParams.board || '';
  const grade = searchParams.grade || '';
  const type = searchParams.type || '';
  const sort = searchParams.sort || 'createdAt_desc';

  // Build filter
  const filter: Record<string, unknown> = {};
  if (query) {
    filter.text = { $regex: query, $options: 'i' };
  }
  if (subject && subject !== 'All') {
    filter.subject = subject;
  }
  if (board && board !== 'All') {
    filter.board = board;
  }
  if (grade && grade !== 'All') {
    filter.grade = grade;
  }
  if (type && type !== 'All') {
    filter.type = type;
  }

  // Build sort
  let sortOptions: Record<string, 1 | -1> = {};
  switch (sort) {
    case 'createdAt_asc':
      sortOptions = { createdAt: 1 };
      break;
    case 'updatedAt_desc':
      sortOptions = { updatedAt: -1 };
      break;
    case 'text_asc':
      sortOptions = { text: 1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  const LIMIT = 100;
  const questions = await Question.find(filter)
    .sort(sortOptions)
    .limit(LIMIT + 1)
    .lean();

  const truncated = questions.length > LIMIT;
  const displayQuestions = truncated ? questions.slice(0, LIMIT) : questions;

  // Get distinct values for filter dropdowns
  const [subjects, boards, grades, types] = await Promise.all([
    Question.distinct('subject'),
    Question.distinct('board'),
    Question.distinct('grade'),
    Question.distinct('type'),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
          <p className="text-muted-foreground mt-1">
            Browse, filter, and edit questions across all tests.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-border bg-background">
          <form className="flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="text"
                name="query"
                placeholder="Search questions..."
                defaultValue={query}
                className="pl-10 bg-card"
              />
            </div>

            <select
              name="subject"
              defaultValue={subject}
              className="px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card h-10 min-w-[140px]"
            >
              <option value="">All Subjects</option>
              {subjects.filter(Boolean).map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              name="board"
              defaultValue={board}
              className="px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card h-10 min-w-[140px]"
            >
              <option value="">All Boards</option>
              {boards.filter(Boolean).map((b: string) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <select
              name="grade"
              defaultValue={grade}
              className="px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card h-10 min-w-[140px]"
            >
              <option value="">All Grades</option>
              {grades.filter(Boolean).map((g: string) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              name="type"
              defaultValue={type}
              className="px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card h-10 min-w-[140px]"
            >
              <option value="">All Types</option>
              {types.filter(Boolean).map((t: string) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sort}
              className="px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card h-10 min-w-[160px]"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="updatedAt_desc">Recently Updated</option>
              <option value="text_asc">Text (A-Z)</option>
            </select>

            <Button
              type="submit"
              variant="secondary"
              className="border border-border bg-card hover:bg-muted text-foreground"
            >
              Apply
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/teacher/questions">Clear</Link>
            </Button>
          </form>
        </div>

        {truncated && (
          <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800">
            Showing first {LIMIT} results. Refine your filters to see more
            specific results.
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-background text-xs uppercase font-medium text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Question Text</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Board & Grade</th>
                <th className="px-6 py-4">Marks</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayQuestions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No questions found matching your filters.
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                displayQuestions.map((q: any) => {
                  const canEdit = q.createdBy === userId || admin;

                  return (
                    <tr
                      key={q._id.toString()}
                      className="hover:bg-muted transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground max-w-xs">
                        <span title={q.text}>
                          {q.text.length > 80
                            ? q.text.slice(0, 80) + '...'
                            : q.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="font-medium text-foreground bg-card whitespace-nowrap"
                        >
                          {q.type
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{q.subject || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span>{q.board || '-'}</span>
                          {q.grade && (
                            <span className="text-xs text-muted-foreground">
                              {formatGrade(q.board, q.grade)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{q.marks}</td>
                      <td className="px-6 py-4">
                        {q.difficulty ? (
                          <Badge
                            variant="outline"
                            className={
                              DIFFICULTY_COLORS[q.difficulty] ||
                              'bg-muted text-foreground border-border'
                            }
                          >
                            {q.difficulty.charAt(0).toUpperCase() +
                              q.difficulty.slice(1)}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(q.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditQuestionButton
                            question={{
                              _id: q._id.toString(),
                              text: q.text,
                              type: q.type,
                              options: q.options,
                              correctAnswer: q.correctAnswer,
                              marks: q.marks,
                              subject: q.subject,
                              board: q.board,
                              grade: q.grade,
                              topic: q.topic,
                              difficulty: q.difficulty,
                              tags: q.tags,
                            }}
                            canEdit={canEdit}
                          />
                          <DeleteQuestionButton
                            questionId={q._id.toString()}
                            questionText={q.text}
                            canDelete={canEdit}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
