'use client';

import { useState } from 'react';
import { getStudentResults } from './actions';
import { Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function ParentDashboard() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await getStudentResults(email);
      if (res.error) {
        setError(res.error);
      } else {
        setResults(res.data);
      }
    } catch (err) {
      setError('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Track your child's learning progress.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Student Email to View Scores
        </label>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            placeholder="student@example.com"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
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

      {results && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Performance History
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result: any) => (
              <div
                key={result._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {result.testId?.title}
                    </h3>
                    <span className="text-sm text-gray-500">
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
                    <p className="text-xs font-semibold text-gray-500 uppercase">
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
                          <span className="text-xs text-gray-500">
                            +{result.weakAreas.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-green-600">None detected!</p>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 text-right">
                    Attempted on {formatDate(result.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No results found for this student.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
