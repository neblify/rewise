import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test, { ISection } from '@/lib/db/models/Test';
import User from '@/lib/db/models/User';
import mongoose from 'mongoose';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DeleteTestButton from './components/DeleteTestButton';

interface LeanTest {
  _id: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  board?: string;
  grade?: string;
  createdBy: string;
  sections?: ISection[];
  isPublished: boolean;
  isTimed?: boolean;
  durationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface LeanUser {
  _id: mongoose.Types.ObjectId;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{
    query?: string;
    subject?: string;
    board?: string;
    sort?: string;
    creator?: string;
  }>;
}

export default async function TeacherDashboard(props: Props) {
  const searchParams = await props.searchParams;
  const { userId } = await currentAuth();

  if (!userId) {
    redirect('/');
  }

  await dbConnect();

  const query = searchParams.query || '';
  const subject = searchParams.subject || '';
  const board = searchParams.board || '';
  const sort = searchParams.sort || 'createdAt_desc';

  // Build Filter
  const filter: Record<string, unknown> = {};
  if (query) {
    filter.title = { $regex: query, $options: 'i' };
  }
  if (subject && subject !== 'All') {
    filter.subject = subject;
  }
  if (board && board !== 'All') {
    filter.board = board;
  }

  // Build Sort
  let sortOptions: Record<string, 1 | -1> = {};
  switch (sort) {
    case 'createdAt_desc':
      sortOptions = { createdAt: -1 };
      break;
    case 'createdAt_asc':
      sortOptions = { createdAt: 1 };
      break;
    case 'updatedAt_desc':
      sortOptions = { updatedAt: -1 };
      break;
    case 'updatedAt_asc':
      sortOptions = { updatedAt: 1 };
      break;
    case 'title_asc':
      sortOptions = { title: 1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  const tests = await Test.find(filter).sort(sortOptions).lean();

  // Get Authors
  const creatorIds = Array.from(
    new Set((tests as LeanTest[]).map(t => t.createdBy))
  );
  const creators = await User.find({ clerkId: { $in: creatorIds } }).lean();
  const creatorMap = new Map((creators as LeanUser[]).map(c => [c.clerkId, c]));

  // Get distinct values for filters
  const subjects = await Test.distinct('subject');
  const boards = await Test.distinct('board');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Tests</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage all tests in the system.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/teacher/create-test">
            <Plus className="h-4 w-4 mr-2" />
            Create New Test
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-border bg-background">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="text"
                name="query"
                placeholder="Search tests..."
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
              {subjects.map((s: string) => (
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
              {boards.map((b: string) => (
                <option key={b} value={b}>
                  {b}
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
              <option value="title_asc">Name (A-Z)</option>
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
              <Link href="/teacher">Clear</Link>
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-background text-xs uppercase font-medium text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Subject & Board</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No tests found matching your filters.
                  </td>
                </tr>
              ) : (
                (tests as LeanTest[]).map(test => {
                  const creator = creatorMap.get(test.createdBy);
                  const creatorName = creator
                    ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() ||
                      creator.email
                    : 'Unknown';
                  const questionCount =
                    test.sections?.reduce(
                      (acc: number, s: ISection) =>
                        acc + (s.questions?.length || 0),
                      0
                    ) || 0;

                  return (
                    <tr
                      key={String(test._id)}
                      className="hover:bg-muted transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {test.title}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant="outline"
                            className="font-medium text-foreground bg-card"
                          >
                            {test.subject}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {test.board} {test.grade && `• Class ${test.grade}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{questionCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-light flex items-center justify-center text-xs text-primary font-bold uppercase">
                            {creatorName.charAt(0)}
                          </div>
                          <span
                            className="truncate max-w-[120px]"
                            title={creatorName}
                          >
                            {creatorName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs space-y-1">
                        <div>
                          <span className="text-muted-foreground">
                            Created:
                          </span>{' '}
                          {formatDate(test.createdAt)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Updated:
                          </span>{' '}
                          {formatDate(test.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant={test.isPublished ? 'default' : 'secondary'}
                            className={
                              test.isPublished
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200'
                            }
                          >
                            {test.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          {test.isPublished && test.isTimed && (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                            >
                              Timed
                              {test.durationMinutes != null &&
                                test.durationMinutes > 0 &&
                                ` ${Math.floor(test.durationMinutes / 60)}h ${test.durationMinutes % 60}m`}
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right space-x-3">
                        <Link
                          href={`/teacher/test/${test._id}/results`}
                          className="text-primary hover:text-primary/90 font-medium"
                        >
                          Results
                        </Link>
                        {test.createdBy === userId && (
                          <>
                            <Link
                              href={`/teacher/create-test/${test._id}`}
                              className="text-muted-foreground hover:text-foreground font-medium"
                            >
                              Edit
                            </Link>
                            <DeleteTestButton
                              testId={test._id.toString()}
                              testTitle={test.title}
                              createdBy={test.createdBy}
                              currentUserId={userId}
                            />
                          </>
                        )}
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
