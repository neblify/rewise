'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  generateOpenChallengeQuestions,
  createOpenChallengeTest,
  getMyOpenChallengeResults,
  addFriend,
  deleteOpenChallengeTest,
} from './actions';
import { Loader2, Send, Trash2, Users, X } from 'lucide-react';

type SectionState = {
  id: number;
  title: string;
  description: string;
  questions: Array<{
    id: number;
    text: string;
    type: string;
    options?: string[];
    leftColumn?: string[];
    correctAnswer?: string | string[] | number[];
    marks: number;
  }>;
};

type ResultItem = {
  _id: string;
  testId: string;
  title: string;
  totalScore: number;
  maxScore: number;
  createdAt: string;
  creatorName: string;
  isOwner: boolean;
};

type Props = { dashboardHref: string };

export default function OpenChallengeClient({ dashboardHref }: Props) {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [qType, setQType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('Medium');
  const [sections, setSections] = useState<SectionState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [inviteResultId, setInviteResultId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTestId, setInviteTestId] = useState('');
  const [inviteScore, setInviteScore] = useState(0);
  const [addingFriend, setAddingFriend] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);
  const [loadResults, setLoadResults] = useState(0);

  useEffect(() => {
    getMyOpenChallengeResults().then(r => {
      if (r.results?.length) setResults(r.results);
    });
  }, [loadResults]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await generateOpenChallengeQuestions(topic, count, qType, difficulty);
      if (res.data) {
        setSections([
          {
            id: Date.now(),
            title: `Open Challenge: ${topic}`,
            description: `${difficulty} - ${qType}`,
            questions: res.data.map((q: Record<string, unknown>, i: number) => ({
              id: Date.now() + i,
              text: q.text as string,
              type: (q.type as string) || 'mcq',
              options: q.options as string[] | undefined,
              leftColumn: q.leftColumn as string[] | undefined,
              correctAnswer: q.correctAnswer as string | string[] | number[] | undefined,
              marks: (q.marks as number) || 1,
            })),
          },
        ]);
      } else {
        alert(res.error || 'Failed to generate');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAndTake = async () => {
    if (!sections.length || !sections[0].questions.length) return;
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.set('title', `Open Challenge: ${topic || 'Assessment'}`);
      formData.set('subject', topic || 'General');
      formData.set(
        'sections',
        JSON.stringify(
          sections.map(s => ({
            title: s.title,
            description: s.description,
            questions: s.questions.map(({ id: _id, ...q }) => q),
          }))
        )
      );
      const out = await createOpenChallengeTest(null, formData);
      if (out && 'testId' in out && out.testId) {
        router.push(`/student/test/${out.testId}`);
        return;
      }
      alert((out as { message?: string })?.message || 'Failed to create test');
    } catch {
      alert('Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddFriend = async () => {
    if (!inviteEmail.trim() || !inviteResultId || !inviteTestId) return;
    setAddingFriend(true);
    try {
      const res = await addFriend(inviteEmail.trim(), inviteTestId, inviteResultId, inviteScore);
      if (res?.success) {
        setInviteEmail('');
        setInviteResultId(null);
        setInviteTestId('');
        setInviteScore(0);
        setLoadResults(r => r + 1);
      } else {
        alert(res?.error || 'Failed to add');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setAddingFriend(false);
    }
  };

  const openInvite = (r: ResultItem) => {
    setInviteResultId(r._id);
    setInviteTestId(r.testId);
    setInviteScore(r.totalScore);
  };

  const handleDeleteChallenge = async (testId: string) => {
    if (!confirm('Delete this Open Challenge? Results and invites for it will be removed.')) return;
    setDeletingTestId(testId);
    try {
      const res = await deleteOpenChallengeTest(testId);
      if (res?.success) setLoadResults(prev => prev + 1);
      else alert(res?.error || 'Failed to delete');
    } catch {
      alert('Something went wrong');
    } finally {
      setDeletingTestId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Open Challenge</h1>
          <p className="mt-2 text-muted-foreground">
            Generate an assessment on any topic, take it, then invite friends to beat your score.
          </p>
        </div>

        {/* Generate */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Generate assessment</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. World War II, Quadratic Equations"
                className="w-full rounded-md border border-border px-3 py-2 text-foreground bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Questions</label>
              <select
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full rounded-md border border-border px-3 py-2 text-foreground bg-background"
              >
                {[3, 5, 7, 10].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
              <select
                value={qType}
                onChange={e => setQType(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-foreground bg-background"
              >
                <option value="mcq">MCQ</option>
                <option value="true_false">True/False</option>
                <option value="brief_answer">Brief answer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-foreground bg-background"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Generate questions
            </button>
            {sections.length > 0 && (
              <button
                type="button"
                onClick={handleCreateAndTake}
                disabled={isCreating}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create & take assessment
              </button>
            )}
          </div>
          {sections.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {sections[0].questions.length} questions ready. Click &quot;Create & take assessment&quot; to continue.
            </p>
          )}
        </section>

        {/* Your results & Invite */}
        {results.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Your challenge results</h2>
              <Link
                href="/open-challenge/friends"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Users className="h-4 w-4" />
                View friends
              </Link>
            </div>
            <ul className="space-y-4">
              {results.map(r => (
                <li
                  key={r._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background/50 p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{r.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Created by {r.creatorName} · Score: {r.totalScore} / {r.maxScore}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/student/result/${r._id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View result
                    </Link>
                    <button
                      type="button"
                      onClick={() => openInvite(r)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Invite friends
                    </button>
                    {r.isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDeleteChallenge(r.testId)}
                        disabled={deletingTestId === r.testId}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                        title="Delete this Open Challenge"
                      >
                        {deletingTestId === r.testId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    )}
                  </div>
                  {inviteResultId === r._id && (
                    <div className="w-full mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="Friend's email"
                        className="flex-1 min-w-[200px] rounded-md border border-border px-3 py-2 text-sm text-foreground bg-background"
                      />
                      <button
                        type="button"
                        onClick={handleAddFriend}
                        disabled={!inviteEmail.trim() || addingFriend}
                        className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {addingFriend ? <Loader2 className="h-4 w-4 animate-spin inline" /> : null}
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInviteResultId(null);
                          setInviteTestId('');
                          setInviteEmail('');
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="pt-6 border-t border-border">
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel Challenge
          </Link>
        </div>
      </div>
    </div>
  );
}
