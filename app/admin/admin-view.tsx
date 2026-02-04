'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Users, FileText, ClipboardList, PenTool, LayoutDashboard } from 'lucide-react';

interface AdminViewProps {
    stats: any;
    users: any[];
    tests: any[];
    questions: any[];
}

export default function AdminView({ stats, users, tests, questions }: AdminViewProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'tests', label: 'Tests', icon: FileText },
        { id: 'questions', label: 'Questions', icon: PenTool },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                    <StatCard title="Total Students" value={stats.students} icon={Users} color="blue" />
                    <StatCard title="Total Teachers" value={stats.teachers} icon={Users} color="green" />
                    <StatCard title="Total Parents" value={stats.parents} icon={Users} color="purple" />
                    <StatCard title="Total Tests" value={stats.tests} icon={FileText} color="indigo" />
                    <StatCard title="Total Questions" value={stats.questions} icon={PenTool} color="yellow" />
                    <StatCard title="Total Results" value={stats.results} icon={ClipboardList} color="pink" />
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">All Users</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                                                    user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                                                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'tests' && (
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">All Tests</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tests.map((test) => (
                                    <tr key={test._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.subject}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${test.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {test.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(test.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Questions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {questions.map((q, index) => (
                                    <tr key={q._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-md truncate">{q.text}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{q.type.replace(/_/g, ' ')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.marks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        pink: 'bg-pink-100 text-pink-600',
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
            <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                    <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{value}</div>
                    </dd>
                </div>
            </div>
        </div>
    );
}
