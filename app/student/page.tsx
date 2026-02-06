import { auth } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Play } from 'lucide-react';
import User from '@/lib/db/models/User';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function StudentDashboard() {
  const { userId } = await currentAuth();
  await dbConnect();

  // @ts-ignore
  const user = await User.findOne({ clerkId: userId });

  const query: any = {
    isPublished: true,
    visibility: 'public',
  };

  // If user has profile set, filter by it
  if (user?.board) {
    query.board = user.board;
  }
  if (user?.grade) {
    query.grade = user.grade;
  }

  // @ts-ignore
  const tests = await Test.find(query).sort({ createdAt: -1 });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Available tests for you to attempt.
        </p>
        {(!user?.board || !user?.grade) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start justify-between">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Complete your profile
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Set your Board and Grade to see relevant tests. Currently
                  showing all public tests.
                </p>
              </div>
            </div>
            <Link
              href="/student/profile"
              className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
            >
              Update Profile
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test: any) => (
          <Card
            key={test._id}
            className="hover:shadow-md transition-shadow group border-gray-100"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {test.title}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 mt-2"
                  >
                    {test.subject}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-sm text-gray-500 space-y-2">
                <p>
                  {(test.questions?.length || 0) +
                    (test.sections?.reduce(
                      (acc: number, section: any) =>
                        acc + (section.questions?.length || 0),
                      0
                    ) || 0)}{' '}
                  Questions
                </p>
                <p>Added on {formatDate(test.createdAt)}</p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="indigo" className="w-full">
                <Link href={`/student/test/${test._id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {tests.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            No tests available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
