import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { getAvailableSubjects } from './actions';
import SearchMaterial from './SearchMaterial';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StudyMaterialPage() {
  const { userId } = await currentAuth();
  await dbConnect();

  const user = await User.findOne({ clerkId: userId });
  const board = user?.board as string | undefined;
  const grade = user?.grade as string | undefined;

  // Get available subjects for the student's board/grade
  const materials = await getAvailableSubjects(board, grade);
  const subjects = [
    ...new Set(materials.map((m: { subject: string }) => m.subject)),
  ];

  // Group materials by subject for browse section
  const bySubject: Record<
    string,
    { topic: string; title: string; _id: string }[]
  > = {};
  for (const m of materials) {
    if (!bySubject[m.subject]) bySubject[m.subject] = [];
    bySubject[m.subject].push({ topic: m.topic, title: m.title, _id: m._id });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Study Material</h1>
        <p className="text-muted-foreground mt-1">
          Search through course material to find relevant study content.
        </p>
        {(!board || !grade) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start justify-between">
            <div className="flex gap-3">
              <span className="text-2xl">&#9888;&#65039;</span>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Complete your profile
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Set your Board and Grade to see material relevant to you.
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

      {/* Search Section */}
      <SearchMaterial
        board={board}
        grade={grade}
        subjects={subjects as string[]}
      />

      {/* Browse Section */}
      {Object.keys(bySubject).length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Available Material
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(bySubject).map(([subjectName, items]) => (
              <div
                key={subjectName}
                className="bg-card rounded-xl border-2 border-border p-5"
              >
                <h3 className="font-semibold text-foreground mb-3">
                  {subjectName}
                </h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item._id}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>
                        {item.title}{' '}
                        <span className="text-xs text-muted-foreground/60">
                          ({item.topic})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
