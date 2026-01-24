'use client';

import { useState } from 'react';
import { ITest, IQuestion } from '@/lib/db/models/Test';
import { submitTest } from './actions';
import { cn } from '@/lib/utils';

export default function TestTaker({ test, userId }: { test: ITest; userId: string }) {
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!confirm('Are you sure you want to submit the test?')) return;

        setIsSubmitting(true);
        try {
            await submitTest(test._id as unknown as string, answers);
        } catch (error) {
            alert('Failed to submit test');
            setIsSubmitting(false);
        }
    };

    // Helper to render a single question
    const renderQuestion = (q: IQuestion, qIndex: number, uniqueId: string) => (
        <div key={uniqueId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
            <div className="flex gap-4">
                <span className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm">
                    {qIndex + 1}
                </span>
                <div className="flex-1 space-y-4">
                    <div>
                        <div className="flex justify-between items-start">
                            <p className="text-lg font-medium text-gray-900">{q.text}</p>
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {q.marks} Marks
                            </span>
                        </div>
                        {q.mediaUrl && (
                            <img src={q.mediaUrl} alt="Question Image" className="mt-4 rounded-lg max-h-64 object-cover" />
                        )}
                    </div>

                    {/* Render Input based on Type */}
                    {q.type === 'mcq' && (
                        <div className="space-y-2">
                            {q.options?.map((opt, i) => (
                                <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name={`q-${uniqueId}`}
                                        value={opt}
                                        checked={answers[uniqueId] === opt}
                                        onChange={(e) => handleAnswerChange(uniqueId, e.target.value)}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {q.type === 'true_false' && (
                        <div className="flex gap-4">
                            {['True', 'False'].map((opt) => (
                                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name={`q-${uniqueId}`}
                                        value={opt}
                                        checked={answers[uniqueId] === opt}
                                        onChange={(e) => handleAnswerChange(uniqueId, e.target.value)}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {['fill_in_blanks', 'single_word', 'one_sentence', 'brief_answer', 'picture_based', 'difference'].includes(q.type) && (
                        <textarea
                            value={answers[uniqueId] || ''}
                            onChange={(e) => handleAnswerChange(uniqueId, e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            rows={q.type === 'brief_answer' || q.type === 'difference' ? 4 : 1}
                            placeholder="Type your answer here..."
                        />
                    )}

                    {q.type === 'match_columns' && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Enter the matching pairs below (e.g. 1-A, 2-B)</p>
                            <textarea
                                value={answers[uniqueId] || ''}
                                onChange={(e) => handleAnswerChange(uniqueId, e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                rows={4}
                                placeholder="Write your matches..."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                <div className="flex gap-4 text-sm text-gray-500 mt-2">
                    <span>{test.subject}</span>
                    <span>•</span>
                    <span>{test.board || 'Standard'} Board</span>
                    <span>•</span>
                    <span>Grade {test.grade || 'N/A'}</span>
                </div>
            </div>

            <div className="space-y-8">
                {test.sections?.map((section, sIndex) => (
                    <div key={sIndex} className="space-y-4">
                        <div className="flex items-baseline gap-2 border-b border-gray-200 pb-2">
                            <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                            {section.description && <span className="text-sm text-gray-500">{section.description}</span>}
                        </div>

                        {section.questions.map((q, qIndex) => renderQuestion(q, qIndex, `${sIndex}-${qIndex}`))}
                    </div>
                ))}

                {/* Fallback for legacy tests with flat questions */}
                {(!test.sections || test.sections.length === 0) && test.questions?.map((q, index) => renderQuestion(q, index, index.toString()))}

                <div className="flex justify-end pt-8 pb-20">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                </div>
            </div>
        </div>
    );
}
