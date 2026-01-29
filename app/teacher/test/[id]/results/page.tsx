import { auth, clerkClient } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question'; // Ensure model is registered
import Result from '@/lib/db/models/Result';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function TestResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;

  await dbConnect();

  // Fetch test to ensure it exists and belongs to this teacher
  // @ts-ignore
  const test = await Test.findOne({ _id: id, createdBy: userId })
    .populate({
      path: 'sections.questions',
      model: Question,
    })
    .populate({
      path: 'questions',
      model: Question,
    });

  if (!test) notFound();

  // Fetch all results for this test
  // @ts-ignore
  const results = await Result.find({ testId: id }).sort({ createdAt: -1 });

  // Fetch user details from Clerk
  const studentIds = [...new Set(results.map((r: any) => r.studentId))];
  const client = await clerkClient();

  const userMap: Record<string, any> = {};
  if (studentIds.length > 0) {
    try {
      const users = await client.users.getUserList({
        userId: studentIds as string[],
      });
      users.data.forEach(user => {
        userMap[user.id] = {
          name:
            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
            user.username ||
            'Student',
          email: user.emailAddresses[0]?.emailAddress,
          imageUrl: user.imageUrl,
        };
      });
    } catch (error) {
      console.error('Failed to fetch users from Clerk:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <Link
            href="/teacher"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {test.title} - Results
              </h1>
              <p className="text-gray-500 mt-1">Student performance overview</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Total Attempts</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {results.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Average Score</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {results.length > 0
                ? Math.round(
                    results.reduce(
                      (acc: number, curr: any) =>
                        acc + (curr.totalScore / curr.maxScore) * 100,
                      0
                    ) / results.length
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result: any) => {
                  // Use studentId details if populated, otherwise fallback (future proofing if User model isn't fully linked yet)
                  // In a real app, you'd rely on Clerk's user info or a synced User model
                  // Get student info from our map
                  const studentInfo = userMap[result.studentId] || {
                    name: 'Student',
                    imageUrl: null,
                  };
                  const studentName = studentInfo.name || 'Student';
                  const percentage = Math.round(
                    (result.totalScore / result.maxScore) * 100
                  );

                  // Determine pass/fail based on 33% (BIOS/CBSE standard)
                  const passed = percentage >= 33;

                  return (
                    <tr key={result._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                            {studentInfo.imageUrl ? (
                              <img
                                src={studentInfo.imageUrl}
                                alt={studentName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {studentName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(result.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {result.totalScore} / {result.maxScore}
                          <span className="ml-2 text-gray-500 font-normal">
                            ({percentage}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/student/result/${result._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No students have taken this test yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
