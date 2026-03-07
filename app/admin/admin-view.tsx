'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  Users,
  FileText,
  ClipboardList,
  PenTool,
  LayoutDashboard,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { deleteUsers } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants/admins';
import type { ISection } from '@/lib/db/models/Test';

interface AdminViewProps {
  stats: {
    students: number;
    teachers: number;
    parents: number;
    tests: number;
    questions: number;
    challenges: number;
  };
  users: Array<{
    _id: string;
    clerkId?: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    [key: string]: unknown;
  }>;
  tests: Array<{
    _id: string;
    title: string;
    subject: string;
    board?: string;
    grade?: string;
    sections?: ISection[];
    createdAt: Date;
    updatedAt?: Date;
    createdByDisplay: string;
    isPublished?: boolean;
    isTimed?: boolean;
    durationMinutes?: number;
    [key: string]: unknown;
  }>;
  questions: Array<{
    _id: string;
    text: string;
    type: string;
    subject: string;
    createdAt: Date;
    marks?: number;
    [key: string]: unknown;
  }>;
  challenges: Array<{
    _id: string;
    title: string;
    creatorName: string;
    sampleResultId?: string | null;
  }>;
}

export default function AdminView({
  stats,
  users,
  tests,
  questions,
  challenges,
}: AdminViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [userRoleFilter, setUserRoleFilter] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllUsers = () => {
    const targetUsers = filteredUsers;
    if (targetUsers.length === 0) return;
    const allSelected = targetUsers.every(u => selectedUserIds.has(u._id));
    if (allSelected) {
      const next = new Set(selectedUserIds);
      targetUsers.forEach(u => next.delete(u._id));
      setSelectedUserIds(next);
    } else {
      const next = new Set(selectedUserIds);
      targetUsers.forEach(u => next.add(u._id));
      setSelectedUserIds(next);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUserIds.size === 0) return;
    if (!confirm(`Delete ${selectedUserIds.size} user(s)? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await deleteUsers([...selectedUserIds]);
      if (res?.error) alert(res.error);
      else {
        setSelectedUserIds(new Set());
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  };

  const userDisplayName = (u: (typeof users)[0]) =>
    [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'tests', label: 'Tests', icon: FileText },
    { id: 'questions', label: 'Questions', icon: PenTool },
    { id: 'challenges', label: 'Challenges', icon: ClipboardList },
  ];

  const filteredUsers =
    userRoleFilter != null ? users.filter(u => u.role === userRoleFilter) : users;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="bg-card rounded-lg shadow-sm border border-border p-1 flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'users') {
                    setUserRoleFilter(null);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-violet-light text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Students"
            value={stats.students}
            icon={Users}
            color="blue"
            onClick={() => {
              setUserRoleFilter('student');
              setActiveTab('users');
            }}
            clickable
          />
          <StatCard
            title="Total Teachers"
            value={stats.teachers}
            icon={Users}
            color="green"
            onClick={() => {
              setUserRoleFilter('teacher');
              setActiveTab('users');
            }}
            clickable
          />
          <StatCard
            title="Total Parents"
            value={stats.parents}
            icon={Users}
            color="purple"
            onClick={() => {
              setUserRoleFilter('parent');
              setActiveTab('users');
            }}
            clickable
          />
          <StatCard
            title="Total Tests"
            value={stats.tests}
            icon={FileText}
            color="indigo"
            onClick={() => {
              setActiveTab('tests');
            }}
            clickable
          />
          <StatCard
            title="Total Questions"
            value={stats.questions}
            icon={PenTool}
            color="yellow"
            onClick={() => {
              setActiveTab('questions');
            }}
            clickable
          />
          <StatCard
            title="Total Challenges"
            value={stats.challenges}
            icon={ClipboardList}
            color="pink"
            onClick={() => {
              setActiveTab('challenges');
            }}
            clickable
          />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-card shadow-sm rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-border flex items-center justify-between gap-4">
            <h3 className="text-lg leading-6 font-medium text-foreground">
              All Users
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deleting || selectedUserIds.size === 0}
                className="inline-flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete selected
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all users"
                      checked={
                        filteredUsers.length > 0 &&
                        filteredUsers.every(u => selectedUserIds.has(u._id))
                      }
                      onChange={toggleAllUsers}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredUsers.map(user => {
                  const isAdminUser =
                    user.role === 'admin' || ADMIN_EMAILS.includes(user.email);

                  return (
                    <tr key={user._id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          aria-label={`Select user ${user.email}`}
                          checked={selectedUserIds.has(user._id)}
                          onChange={() => toggleUser(user._id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/users/${user._id}`}
                            className="text-primary hover:underline"
                          >
                            {userDisplayName(user)}
                          </Link>
                          {isAdminUser && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-800"
                              title="Admin user"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${
                          user.role === 'teacher'
                            ? 'bg-green-100 text-green-800'
                            : user.role === 'student'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-muted text-muted-foreground'
                        }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="bg-card shadow-sm rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-border">
            <h3 className="text-lg leading-6 font-medium text-foreground">
              All Tests
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Subject & Board
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {tests.map(test => {
                  const questionCount =
                    test.sections?.reduce(
                      (acc: number, s: ISection) =>
                        acc + (s.questions?.length || 0),
                      0
                    ) || 0;
                  return (
                    <tr
                      key={test._id}
                      className="hover:bg-muted transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        <Link
                          href={`/admin/tests/${test._id}`}
                          className="text-primary hover:underline"
                        >
                          {test.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant="outline"
                            className="font-medium text-foreground bg-card"
                          >
                            {test.subject}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {test.board ?? '—'}{' '}
                            {test.grade ? `• Class ${test.grade}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {questionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {test.createdByDisplay}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground text-xs space-y-1">
                        <div>
                          <span className="text-muted-foreground">Created:</span>{' '}
                          {formatDate(test.createdAt)}
                        </div>
                        {test.updatedAt && (
                          <div>
                            <span className="text-muted-foreground">Updated:</span>{' '}
                            {formatDate(test.updatedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant={test.isPublished ? 'default' : 'secondary'}
                            className={
                              test.isPublished
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200'
                            }
                          >
                            {test.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          {test.isPublished && test.isTimed && (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                            >
                              Timed
                              {test.durationMinutes != null &&
                                test.durationMinutes > 0 &&
                                ` ${Math.floor(test.durationMinutes / 60)}h ${test.durationMinutes % 60}m`}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="bg-card shadow-sm rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-border">
            <h3 className="text-lg leading-6 font-medium text-foreground">
              Recent Questions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Marks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {questions.map((q, index) => (
                  <tr key={q._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground max-w-md truncate">
                      {q.text}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground capitalize">
                      {q.type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {q.marks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="bg-card shadow-sm rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-border">
            <h3 className="text-lg leading-6 font-medium text-foreground">
              Open Challenges
            </h3>
          </div>
          <div className="divide-y divide-border">
            {challenges.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No Open Challenges found.
              </p>
            ) : (
              challenges.map(challenge => (
                <Link
                  key={challenge._id}
                  href={`/admin/challenges/${challenge._id}`}
                  className="block px-4 py-4 hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-foreground">
                    {challenge.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created by {challenge.creatorName}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  clickable,
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-violet-light text-primary',
    yellow: 'bg-yellow-100 text-yellow-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-card overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 ${
        clickable ? 'cursor-pointer hover:bg-muted transition-colors' : ''
      }`}
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-foreground">
              {value}
            </div>
          </dd>
        </div>
      </div>
    </button>
  );
}
