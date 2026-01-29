import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db/connect';
import Test, { ITest } from '@/lib/db/models/Test';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function TeacherDashboard() {
  const { userId } = await auth();
  await dbConnect();

  // @ts-ignore
  const tests = await Test.find({ createdBy: userId }).sort({ createdAt: -1 });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your tests and view student progress.
          </p>
        </div>
        <Link
          href="/teacher/create-test"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Test
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test: any) => (
          <div
            key={test._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {test.title}
                </h3>
                <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full mt-1">
                  {test.subject}
                </span>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${test.isPublished ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}
              >
                {test.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="text-sm text-gray-500 space-y-2">
              <p>{test.questions.length} Questions</p>
              <p>Created on {formatDate(test.createdAt)}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
              <Link
                href={`/teacher/test/${test._id}/results`}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View Results
              </Link>
              <Link
                href={`/teacher/create-test/${test._id}`}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Edit Test
              </Link>
            </div>
          </div>
        ))}

        {tests.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">
              You haven't created any tests yet.
            </p>
            <Link
              href="/teacher/create-test"
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
            >
              Create your first test
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
