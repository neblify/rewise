import { auth } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import User from '@/lib/db/models/User';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDurationMinutes } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DeleteTestButton from './components/DeleteTestButton';

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
  const filter: any = {};
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
  let sortOptions: any = {};
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
  const creatorIds = Array.from(new Set(tests.map((t: any) => t.createdBy)));
  const creators = await User.find({ clerkId: { $in: creatorIds } }).lean();
  const creatorMap = new Map(creators.map((c: any) => [c.clerkId, c]));

  // Get distinct values for filters
  const subjects = await Test.distinct('subject');
  const boards = await Test.distinct('board');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tests</h1>
          <p className="text-gray-500 mt-1">
            Browse and manage all tests in the system.
          </p>
        </div>
        <Button asChild variant="indigo">
          <Link href="/teacher/create-test">
            <Plus className="h-4 w-4 mr-2" />
            Create New Test
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Input
                type="text"
                name="query"
                placeholder="Search tests..."
                defaultValue={query}
                className="pl-10 bg-white"
              />
            </div>

            <select
              name="subject"
              defaultValue={subject}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white h-10 min-w-[140px]"
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
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white h-10 min-w-[140px]"
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
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white h-10 min-w-[160px]"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="updatedAt_desc">Recently Updated</option>
              <option value="title_asc">Name (A-Z)</option>
            </select>

            <Button
              type="submit"
              variant="secondary"
              className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            >
              Apply
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              <Link href="/teacher">Clear</Link>
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Subject & Board</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No tests found matching your filters.
                  </td>
                </tr>
              ) : (
                tests.map((test: any) => {
                  const creator = creatorMap.get(test.createdBy);
                  const creatorName = creator
                    ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() ||
                      creator.email
                    : 'Unknown';
                  const questionCount =
                    test.sections?.reduce(
                      (acc: number, s: any) => acc + (s.questions?.length || 0),
                      0
                    ) || 0;

                  return (
                    <tr
                      key={test._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {test.title}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant="outline"
                            className="font-medium text-gray-900 bg-white"
                          >
                            {test.subject}
                          </Badge>
                          <span className="text-gray-400 text-xs">
                            {test.board} {test.grade && `• Class ${test.grade}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{questionCount}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {test.isPublished && test.isTimed && test.durationMinutes != null
                          ? formatDurationMinutes(test.durationMinutes)
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-bold uppercase">
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
                          <span className="text-gray-400">Created:</span>{' '}
                          {formatDate(test.createdAt)}
                        </div>
                        <div>
                          <span className="text-gray-400">Updated:</span>{' '}
                          {formatDate(test.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      </td>

                      <td className="px-6 py-4 text-right space-x-3">
                        <Link
                          href={`/teacher/test/${test._id}/results`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Results
                        </Link>
                        {test.createdBy === userId && (
                          <>
                            <Link
                              href={`/teacher/create-test/${test._id}`}
                              className="text-gray-500 hover:text-gray-900 font-medium"
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
