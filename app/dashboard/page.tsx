import mongoose from 'mongoose';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Result from '@/lib/db/models/Result';
import { redirect } from 'next/navigation';
import {
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle,
  BarChart2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface LeanTest {
  _id: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  grade?: string;
  createdAt: Date;
}

interface LeanResult {
  _id: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  studentId: string;
  totalScore: number;
  maxScore: number;
  createdAt: Date;
}

export default async function Dashboard() {
  const { userId } = await currentAuth();

  if (!userId) {
    redirect('/');
  }

  await dbConnect();

  // 1. Inventory Metric: Total authored assessments
  const authoredTests = await Test.find({ createdBy: userId })
    .select('_id title subject grade createdAt')
    .lean();

  const testIds = authoredTests.map((t: LeanTest) => t._id);
  const inventoryCount = authoredTests.length;

  // 2. Engagement & Performance Metrics
  const results = await Result.find({ testId: { $in: testIds } })
    .sort({ createdAt: 1 })
    .lean();

  const totalAttempts = results.length;
  const uniqueStudents = new Set(results.map((r: LeanResult) => r.studentId))
    .size;

  let totalScorePercentage = 0;
  let passedCount = 0;

  // Assume pass mark is 40% if not defined
  const PASS_THRESHOLD = 40;

  results.forEach((r: LeanResult) => {
    const percentage = r.maxScore > 0 ? (r.totalScore / r.maxScore) * 100 : 0;
    totalScorePercentage += percentage;
    if (percentage >= PASS_THRESHOLD) {
      passedCount++;
    }
  });

  const avgScore =
    totalAttempts > 0 ? (totalScorePercentage / totalAttempts).toFixed(1) : 0;
  const passRate =
    totalAttempts > 0 ? ((passedCount / totalAttempts) * 100).toFixed(1) : 0;

  // 3. Trend Metrics: Attempts per day
  // Group by date (YYYY-MM-DD)
  const attemptsByDate: Record<string, number> = {};
  results.forEach((r: LeanResult) => {
    const date = new Date(r.createdAt).toISOString().split('T')[0];
    attemptsByDate[date] = (attemptsByDate[date] || 0) + 1;
  });

  // Get last 7 days for the chart
  const recentDates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    recentDates.push(d.toISOString().split('T')[0]);
  }

  const trendData = recentDates.map(date => ({
    date,
    count: attemptsByDate[date] || 0,
  }));

  // 4. Difficulty Index: Tests with lowest average scores
  // Map results to tests
  const testPerformance: Record<
    string,
    { total: number; count: number; title: string }
  > = {};

  // Initialize with all tests to show 0s if needed, or just build from results
  authoredTests.forEach((t: LeanTest) => {
    testPerformance[t._id.toString()] = { total: 0, count: 0, title: t.title };
  });

  results.forEach((r: LeanResult) => {
    const tid = r.testId.toString();
    if (testPerformance[tid]) {
      const percentage = r.maxScore > 0 ? (r.totalScore / r.maxScore) * 100 : 0;
      testPerformance[tid].total += percentage;
      testPerformance[tid].count += 1;
    }
  });

  const difficultyList = Object.values(testPerformance)
    .filter(t => t.count > 0)
    .map(t => ({
      title: t.title,
      avg: t.total / t.count,
      attempts: t.count,
    }))
    .sort((a, b) => a.avg - b.avg) // Lowest score first
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your assessments, student engagement, and performance
            metrics.
          </p>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Tests"
            value={inventoryCount}
            icon={<BookOpen className="w-5 h-5 text-primary" />}
            subtext="Authored by you"
            color="bg-violet-light"
          />
          <MetricCard
            title="Total Attempts"
            value={totalAttempts}
            icon={<Target className="w-5 h-5 text-blue-600" />}
            subtext={`${uniqueStudents} unique students`}
            color="bg-blue-50"
          />
          <MetricCard
            title="Average Score"
            value={`${avgScore}%`}
            icon={<BarChart2 className="w-5 h-5 text-emerald-600" />}
            subtext={`Pass Rate: ${passRate}%`}
            color="bg-emerald-50"
          />
          <MetricCard
            title="Engagement Rate"
            value={
              inventoryCount > 0
                ? (totalAttempts / inventoryCount).toFixed(1)
                : 0
            }
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
            subtext="Avg attempts per test"
            color="bg-purple-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area: Attempts over time */}
          <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                Activity Trend (Last 7 Days)
              </h3>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {trendData.map(d => {
                const max = Math.max(...trendData.map(i => i.count), 1);
                const height = (d.count / max) * 100;
                return (
                  <div
                    key={d.date}
                    className="flex flex-col items-center gap-2 flex-1 group"
                  >
                    <div
                      className="relative w-full bg-violet-light rounded-t-lg hover:bg-violet-light/80 transition-colors flex items-end justify-center"
                      style={{ height: '100%' }}
                    >
                      <div
                        className="w-full mx-1 bg-primary rounded-t-sm opacity-80 group-hover:opacity-100 transition-all relative"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {d.count} Attempts
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium rotate-0 truncate w-full text-center">
                      {new Date(d.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Panel: Difficulty Index */}
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Fields of Focus
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tests with the lowest average scores, indicating areas where
              students struggle.
            </p>

            <div className="flex-1 overflow-auto pr-1">
              {difficultyList.length > 0 ? (
                <div className="space-y-3">
                  {difficultyList.map((test, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4
                          className="font-medium text-foreground text-sm line-clamp-1"
                          title={test.title}
                        >
                          {test.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {test.attempts} attempts
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full ${
                            test.avg < 40
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {test.avg.toFixed(1)}% Avg
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${test.avg < 40 ? 'bg-red-500' : 'bg-amber-500'}`}
                          style={{ width: `${test.avg}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground italic">
                  <p>No attempts recorded yet.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Link
                href="/teacher"
                className="text-sm text-primary hover:text-primary/90 font-medium flex items-center justify-center"
              >
                View All Tests &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
  color: string;
}

function MetricCard({ title, value, icon, subtext, color }: MetricCardProps) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
}
