'use client';

import { useState } from 'react';
import { getStudentResults, getLinkedStudents } from './actions';
import { Search, User as UserIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useEffect } from 'react';

interface ParentResult {
  _id: string;
  testId?: { title?: string; subject?: string };
  totalScore: number;
  maxScore: number;
  weakAreas?: string[];
  createdAt: string;
}

interface LinkedStudent {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function ParentDashboard() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<ParentResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);

  useEffect(() => {
    async function loadLinkedStudents() {
      try {
        const res = await getLinkedStudents();
        if (res.data) {
          setLinkedStudents(res.data);
        }
      } catch (_e) {
        console.error('Failed to load linked students');
      }
    }
    void loadLinkedStudents();
  }, []);

  const fetchResults = async (studentEmail: string) => {
    setLoading(true);
    setError('');
    setResults(null);
    setEmail(studentEmail);

    try {
      const res = await getStudentResults(studentEmail);
      if (res.error) {
        setError(res.error);
      } else {
        setResults(res.data);
        // Refresh linked students list as the new one might have been added
        const linkedRes = await getLinkedStudents();
        if (linkedRes.data) setLinkedStudents(linkedRes.data);
      }
    } catch (_err) {
      setError('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchResults(email);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Parent Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your child&apos;s learning progress.
        </p>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Enter Student Email to View Scores
        </label>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
            }}
            className="flex-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            placeholder="student@example.com"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md gradient-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-110 focus:outline-none disabled:opacity-50"
          >
            {loading ? (
              'Searching...'
            ) : (
              <>
                <Search className="h-4 w-4" /> View Performance
              </>
            )}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {linkedStudents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Previously Added Students
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {linkedStudents.map(student => (
              <button
                key={student.clerkId}
                onClick={() => fetchResults(student.email)}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-sm transition-all text-left w-full group"
              >
                <div className="h-10 w-10 rounded-full bg-violet-light flex items-center justify-center flex-shrink-0 group-hover:bg-violet-light/80 transition-colors">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {student.firstName
                      ? `${student.firstName} ${student.lastName || ''}`
                      : student.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Performance History
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map(result => (
              <div
                key={result._id}
                className="bg-card rounded-xl shadow-sm border border-border p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {result.testId?.title}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {result.testId?.subject}
                    </span>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      result.totalScore / result.maxScore >= 0.7
                        ? 'text-green-600'
                        : result.totalScore / result.maxScore >= 0.4
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {result.totalScore}/{result.maxScore}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Weak Areas
                    </p>
                    {result.weakAreas && result.weakAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.weakAreas
                          .slice(0, 3)
                          .map((area: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100"
                            >
                              {area}
                            </span>
                          ))}
                        {result.weakAreas.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{result.weakAreas.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-green-600">None detected!</p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-right">
                    Attempted on {formatDate(result.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No results found for this student.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
