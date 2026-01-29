'use client';

import { useActionState, useState, useEffect } from 'react';
import { createTest, updateTest } from '../actions';
import { generateQuestionsAI } from '../ai-actions';
import { Plus, Trash2, Save, Layers, Sparkles, X, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const QUESTION_TYPES = [
  { value: 'fill_in_blanks', label: 'Fill in the blanks' },
  { value: 'match_columns', label: 'Match the columns' },
  { value: 'true_false', label: 'True or False' },
  { value: 'single_word', label: 'One Word' },
  { value: 'one_sentence', label: 'One Sentence' },
  { value: 'picture_based', label: 'Picture Based' },
  { value: 'mcq', label: 'Choose Options' },
  { value: 'brief_answer', label: 'Brief Answer' },
  { value: 'difference', label: 'Difference Between' },
];

const BOARDS = ['NIOS', 'CBSE', 'ICSE', 'State Board'];
const NIOS_LEVELS = ['A', 'B', 'C'];
const STANDARD_LEVELS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString()
);

const generateId = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export default function CreateOrEditTestPage() {
  // Determine if we are in edit mode
  const params = useParams();
  const router = useRouter();
  const isEditMode = params.id && params.id !== 'new';
  const testId = isEditMode ? (params.id as string) : null;

  // Use specific actions based on mode
  const [state, formAction] = useActionState(
    isEditMode ? updateTest : createTest,
    null
  );

  // Initial Loading State
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Test Metadata State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [board, setBoard] = useState('NIOS');
  const [grade, setGrade] = useState('A');
  const [visibility, setVisibility] = useState('public');

  // Sections State
  const [sections, setSections] = useState<any[]>([
    { id: generateId(), title: 'Section A', description: '', questions: [] },
  ]);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState('mcq');
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch test data if in edit mode
  // Fetch test data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetch(`/api/test/${testId}`)
        .then(res => res.json())
        .then(data => {
          if (data.test) {
            setTitle(data.test.title);
            setSubject(data.test.subject);
            setBoard(data.test.board || 'NIOS');
            setGrade(data.test.grade || 'A');
            setVisibility(data.test.visibility || 'public');

            // Transform sections if needed or use existing structure
            // Assuming backend returns sections as matches.
            // If legacy, might need adapting.
            if (data.test.sections && data.test.sections.length > 0) {
              // Sanitize IDs: Existing data might have duplicate or numeric IDs from Date.now() collisions
              const sanitizedSections = data.test.sections.map((sec: any) => ({
                ...sec,
                id: generateId(),
                questions:
                  sec.questions?.map((q: any) => ({
                    ...q,
                    id: generateId(),
                  })) || [],
              }));
              setSections(sanitizedSections);
            } else if (data.test.questions) {
              // Legacy fallback
              setSections([
                {
                  id: generateId(),
                  title: 'General Section',
                  description: 'Imported questions',
                  questions: data.test.questions.map((q: any) => ({
                    ...q,
                    id: generateId(),
                  })), // Sanitize legacy questions too
                },
              ]);
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, testId]);

  // ... (Existing helper functions kept same, but re-included for completeness)
  const addSection = () => {
    setSections([
      ...sections,
      {
        id: generateId(),
        title: `Section ${String.fromCharCode(65 + sections.length)}`,
        description: '',
        questions: [],
      },
    ]);
  };

  const removeSection = (secIndex: number) => {
    setSections(sections.filter((_, i) => i !== secIndex));
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSecs = [...sections];
    newSecs[index] = { ...newSecs[index], [field]: value };
    setSections(newSecs);
  };

  const addQuestionExp = (secIndex: number) => {
    const newSecs = [...sections];
    newSecs[secIndex].questions.push({
      id: generateId(),
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
    });
    setSections(newSecs);
  };

  const removeQuestionExp = (secIndex: number, qIndex: number) => {
    const newSecs = [...sections];
    newSecs[secIndex].questions = newSecs[secIndex].questions.filter(
      (_: any, i: number) => i !== qIndex
    );
    setSections(newSecs);
  };

  const updateQuestionExp = (
    secIndex: number,
    qIndex: number,
    field: string,
    value: any
  ) => {
    const newSecs = [...sections];
    newSecs[secIndex].questions[qIndex] = {
      ...newSecs[secIndex].questions[qIndex],
      [field]: value,
    };
    setSections(newSecs);
  };

  const handleSubmit = (formData: FormData) => {
    console.log('Submitting form with sections:', sections);
    formData.set('sections', JSON.stringify(sections));
    if (isEditMode && testId) {
      formData.set('testId', testId);
    }
    // @ts-ignore
    formAction(formData);
  };

  useEffect(() => {
    if (state?.message) {
      console.log('Server Action Result:', state);
      if (state.message.includes('success')) {
        // Success logic if any
      } else {
        alert(`Error: ${state.message}`);
      }
    }
  }, [state]);

  // AI Handler
  const handleAiGenerate = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);

    try {
      const res = await generateQuestionsAI(
        aiTopic,
        aiCount,
        aiType,
        aiDifficulty,
        board,
        grade
      );

      if (res.data) {
        // Add a new section for these questions
        const newSection = {
          id: generateId(),
          title: `AI Generated: ${aiTopic}`,
          description: `${aiDifficulty} - ${aiType}`,
          questions: res.data.map((q: any) => ({ ...q, id: generateId() })), // Ensure AI questions also get new unique IDs if needed, or rely on server-side ID but client-side ID is safer for lists
        };
        setSections([...sections, newSection]);
        setIsAiModalOpen(false);
        setAiTopic('');
      } else {
        alert(res.error || 'Failed to generate');
      }
    } catch (e) {
      alert('Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-32">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Test' : 'Create New Test'}
            </h1>
            <p className="text-gray-500">
              Configure your test structure, sections, and questions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all font-medium animate-pulse hover:animate-none"
          >
            <Sparkles className="h-5 w-5" />
            AI Assistant
          </button>
        </div>

        <form action={handleSubmit} className="space-y-8">
          {/* Metadata Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
              <Layers className="text-indigo-600 h-5 w-5" />
              <h2 className="text-xl font-semibold text-gray-800">
                Test Configuration
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Test Title
                </label>
                <input
                  name="title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  placeholder="e.g. Science Mid-Term"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Board
                </label>
                <select
                  name="board"
                  value={board}
                  onChange={e => setBoard(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  {BOARDS?.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Level / Class
                </label>
                <select
                  name="grade"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  {board === 'NIOS'
                    ? NIOS_LEVELS?.map(l => (
                        <option key={l} value={l}>
                          Level {l}
                        </option>
                      ))
                    : STANDARD_LEVELS?.map(l => (
                        <option key={l} value={l}>
                          Class {l}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  name="subject"
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  placeholder="e.g. Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                >
                  <option value="public">Public (All Students)</option>
                  <option value="private">Private (Invite Only)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sections Loop */}
          <div className="space-y-8">
            {sections?.map((section, secIndex) => (
              <div
                key={section.id}
                className="rounded-xl bg-white border border-indigo-100 shadow-md overflow-hidden"
              >
                <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <input
                      type="text"
                      value={section.title}
                      onChange={e =>
                        updateSection(secIndex, 'title', e.target.value)
                      }
                      className="bg-transparent text-lg font-bold text-indigo-900 placeholder-indigo-600 focus:outline-none w-full"
                      placeholder="Section Title"
                    />
                    <input
                      type="text"
                      value={section.description}
                      onChange={e =>
                        updateSection(secIndex, 'description', e.target.value)
                      }
                      className="bg-transparent text-sm text-indigo-700 placeholder-indigo-600 focus:outline-none w-full"
                      placeholder="Section Description (Optional)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(secIndex)}
                    className="text-indigo-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {section.questions?.map((q: any, qIndex: number) => (
                    <div
                      key={q.id}
                      className="pl-4 border-l-2 border-gray-200 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeQuestionExp(secIndex, qIndex)}
                        className="absolute top-0 right-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="grid gap-4 mb-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <textarea
                              value={q.text}
                              onChange={e =>
                                updateQuestionExp(
                                  secIndex,
                                  qIndex,
                                  'text',
                                  e.target.value
                                )
                              }
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder={`Question ${qIndex + 1}`}
                              rows={2}
                            />
                          </div>
                          <div className="w-1/4">
                            <select
                              value={q.type}
                              onChange={e =>
                                updateQuestionExp(
                                  secIndex,
                                  qIndex,
                                  'type',
                                  e.target.value
                                )
                              }
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              {QUESTION_TYPES.map(t => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-20">
                            <input
                              type="number"
                              value={q.marks}
                              onChange={e =>
                                updateQuestionExp(
                                  secIndex,
                                  qIndex,
                                  'marks',
                                  parseInt(e.target.value)
                                )
                              }
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                              min={1}
                            />
                          </div>
                        </div>

                        {/* Type Specific Fields - Keeping logic simple for brevity in replacement, assume standard fields */}
                        {/* Standardizing input for brevity in this full file replace */}
                        {q.type === 'mcq' && (
                          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-md">
                            {q.options?.map((opt: string, optIndex: number) => (
                              <input
                                key={optIndex}
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const newOpts = [...q.options];
                                  newOpts[optIndex] = e.target.value;
                                  updateQuestionExp(
                                    secIndex,
                                    qIndex,
                                    'options',
                                    newOpts
                                  );
                                }}
                                className="block w-full rounded border-gray-200 text-sm"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                            ))}
                            <input
                              type="text"
                              value={q.correctAnswer}
                              onChange={e =>
                                updateQuestionExp(
                                  secIndex,
                                  qIndex,
                                  'correctAnswer',
                                  e.target.value
                                )
                              }
                              className="col-span-2 block w-full rounded border-green-200 bg-green-50 text-sm placeholder-green-600"
                              placeholder="Correct Option (Exact Match)"
                            />
                          </div>
                        )}

                        {!['mcq'].includes(q.type) && (
                          <input
                            type="text"
                            value={q.correctAnswer}
                            onChange={e =>
                              updateQuestionExp(
                                secIndex,
                                qIndex,
                                'correctAnswer',
                                e.target.value
                              )
                            }
                            className="block w-full rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                            placeholder="Expected Answer / Key"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addQuestionExp(secIndex)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="h-4 w-4" /> Add Question to {section.title}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-8">
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Layers className="h-4 w-4" /> Add New Section
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all font-medium"
            >
              <Save className="h-5 w-5" />{' '}
              {isEditMode ? 'Update Test' : 'Publish Test'}
            </button>
          </div>
        </form>
      </div>

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Question Generator
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Autogenerate questions for {board} - {grade}
                </p>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic / Chapter
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Newton's Laws of Motion"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={aiType}
                    onChange={e => setAiType(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="mixed">Mixed Types</option>
                    {QUESTION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={e => setAiDifficulty(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions: {aiCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={aiCount}
                  onChange={e => setAiCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiTopic}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Questions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
