import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/connect";
import Test from "@/lib/db/models/Test";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Play } from "lucide-react";

export default async function StudentDashboard() {
    await dbConnect();
    // Fetch only published and public tests
    // @ts-ignore
    const tests = await Test.find({ isPublished: true, visibility: 'public' }).sort({ createdAt: -1 });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-500 mt-1">Available tests for you to attempt.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tests.map((test: any) => (
                    <div key={test._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{test.title}</h3>
                                <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full mt-1">
                                    {test.subject}
                                </span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 space-y-2">
                            <p>{test.questions.length} Questions</p>
                            <p>Added on {formatDate(test.createdAt)}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-50">
                            <Link
                                href={`/student/test/${test._id}`}
                                className="flex items-center justify-center gap-2 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Play className="h-4 w-4" />
                                Start Test
                            </Link>
                        </div>
                    </div>
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
