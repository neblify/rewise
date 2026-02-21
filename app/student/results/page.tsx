import type { Metadata } from 'next';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Result from '@/lib/db/models/Result';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Results | ReWise',
};

interface PopulatedStudentResult {
  _id: string;
  testId?: { title?: string; subject?: string };
  totalScore: number;
  maxScore: number;
  createdAt: Date;
}

export default async function StudentResults() {
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  await dbConnect();
  // Fetch results for this student, populated with Test details
  const results = await Result.find({ studentId: userId })
    .populate('testId', 'title subject maxScore')
    .sort({ createdAt: -1 });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Results</h1>
        <p className="text-muted-foreground mt-1">
          History of your test attempts and performance.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Test Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Performance
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {(results as unknown as PopulatedStudentResult[]).map(
                  result => {
                    const percentage =
                      result.maxScore > 0
                        ? Math.round(
                            (result.totalScore / result.maxScore) * 100
                          )
                        : 0;

                    let gradeColor = 'bg-muted text-muted-foreground';
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
                        className="hover:bg-muted transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-violet-light rounded-lg flex items-center justify-center text-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-foreground">
                                {result.testId?.title || 'Unknown Test'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {result.testId?.subject || 'Subject'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {formatDate(result.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground font-medium">
                            {result.totalScore} / {result.maxScore}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Marks
                          </div>
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
                            className="text-primary hover:text-primary/90 flex items-center justify-end gap-1 hover:gap-2 transition-all"
                          >
                            View <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <h3 className="mt-2 text-sm font-medium text-foreground">
              No results found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven&apos;t taken any tests yet.
            </p>
            <div className="mt-6">
              <Link
                href="/student"
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
