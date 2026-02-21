import type { Metadata } from 'next';
import { clerkClient } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question'; // Ensure model is registered
import Result, { IResult } from '@/lib/db/models/Result';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface StudentInfo {
  name: string;
  email?: string;
  imageUrl?: string | null;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();
  const test = await Test.findById(id).select('title').lean();
  return {
    title: test ? `${test.title} Results | ReWise` : 'Test Results | ReWise',
  };
}

export default async function TestResultsPage(props: Props) {
  const params = await props.params;
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;

  await dbConnect();

  // Fetch test to ensure it exists and belongs to this teacher
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
  const results = await Result.find({ testId: id }).sort({ createdAt: -1 });

  // Fetch user details from Clerk
  const studentIds = [...new Set(results.map((r: IResult) => r.studentId))];
  const client = await clerkClient();

  const userMap: Record<string, StudentInfo> = {};
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
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <Link
            href="/teacher"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {test.title} - Results
              </h1>
              <p className="text-muted-foreground mt-1">
                Student performance overview
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm font-medium text-muted-foreground">
              Total Attempts
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {results.length}
            </p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm font-medium text-muted-foreground">
              Average Score
            </p>
            <p className="text-3xl font-bold text-primary mt-2">
              {results.length > 0
                ? Math.round(
                    results.reduce(
                      (acc: number, curr: IResult) =>
                        acc + (curr.totalScore / curr.maxScore) * 100,
                      0
                    ) / results.length
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Student
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
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {results.map((result: IResult) => {
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
                    <tr key={String(result._id)} className="hover:bg-muted">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                            {studentInfo.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
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
                            <div className="text-sm font-medium text-foreground">
                              {studentName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(result.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground font-medium">
                          {result.totalScore} / {result.maxScore}
                          <span className="ml-2 text-muted-foreground font-normal">
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
                          className="text-primary hover:text-primary/90"
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
                      className="px-6 py-12 text-center text-muted-foreground"
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
