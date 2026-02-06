import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Result from '@/lib/db/models/Result';
import Test from '@/lib/db/models/Test';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

export default async function StudentResults() {
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  await dbConnect();
  // Fetch results for this student, populated with Test details
  // @ts-ignore
  const results = await Result.find({ studentId: userId })
    .populate('testId', 'title subject maxScore')
    .sort({ createdAt: -1 });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-500 mt-1">
          History of your test attempts and performance.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Test Name
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
                    Performance
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result: any) => {
                  const percentage =
                    result.maxScore > 0
                      ? Math.round((result.totalScore / result.maxScore) * 100)
                      : 0;

                  let gradeColor = 'bg-gray-100 text-gray-800';
                  if (percentage >= 80)
                    gradeColor = 'bg-green-100 text-green-800';
                  else if (percentage >= 60)
                    gradeColor = 'bg-blue-100 text-blue-800';
                  else if (percentage >= 40)
                    gradeColor = 'bg-yellow-100 text-yellow-800';
                  else gradeColor = 'bg-red-100 text-red-800';

                  return (
                    <tr
                      key={result._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {result.testId?.title || 'Unknown Test'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.testId?.subject || 'Subject'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(result.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {result.totalScore} / {result.maxScore}
                        </div>
                        <div className="text-xs text-gray-500">Marks</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${gradeColor}`}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/student/result/${result._id}`}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 hover:gap-2 transition-all"
                        >
                          View <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No results found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't taken any tests yet.
            </p>
            <div className="mt-6">
              <Link
                href="/student"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
