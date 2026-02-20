'use client';

import React, { useActionState, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { createTest } from './actions';
import { extractQuestionsFromPdf, generateQuestionsAI } from './ai-actions';
import { DEFAULT_SECTION_TITLE, isEmptyDefaultSection } from './lib/sections';
import {
  Plus,
  Trash2,
  Save,
  Layers,
  Sparkles,
  X,
  Loader2,
  FileUp,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

import {
  BOARDS,
  BOARD_PLACEHOLDER_LABEL,
  BOARD_PLACEHOLDER_VALUE,
} from '@/lib/constants/boards';
import { getGradesForBoard } from '@/lib/constants/levels';
import { defaultTimedState, appendTimedToFormData } from './lib/timed';
import { TestTimeLimitField } from './components/TestTimeLimitField';

type CreateMode = 'ai' | 'manual' | 'pdf';

function CreateTestPageContent() {
  const searchParams = useSearchParams();
  const mode: CreateMode = (searchParams.get('mode') as CreateMode) || 'manual';

  const [state, formAction] = useActionState(createTest, null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (mode === 'pdf' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [mode]);

  useEffect(() => {
    if (state?.message) {
      if (
        !state.message.includes('success') &&
        !state.message.includes('Redirecting')
      ) {
        alert(`Error: ${state.message}`);
      }
    }
  }, [state]);

  // Test Metadata State
  const [testTitle, setTestTitle] = useState('');
  const [board, setBoard] = useState(BOARD_PLACEHOLDER_VALUE);
  const [grade, setGrade] = useState('1');
  const [timedState, setTimedState] = useState(defaultTimedState);

  const gradeOptions = getGradesForBoard(board);

  // Sections State
  const [sections, setSections] = useState<any[]>([
    {
      id: Date.now(),
      title: DEFAULT_SECTION_TITLE,
      description: '',
      questions: [],
    },
  ]);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState('mcq');
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  const showAiAssistant = mode === 'ai';
  const hasGeneratedContent = sections.some((s) => (s.questions?.length ?? 0) > 0);
  const showSectionsList =
    mode === 'manual' ||
    mode === 'pdf' ||
    (mode === 'ai' && hasGeneratedContent);

  // ... (Existing helper functions kept same, but re-included for completeness)
  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now(),
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
      id: Date.now(),
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
    const sectionsJson = JSON.stringify(sections);

    // Estimate payload size (rough approximation in bytes)
    const estimatedSize = new Blob([sectionsJson]).size;
    const maxSize = 4.5 * 1024 * 1024; // 4.5 MB to stay under 5 MB limit

    if (estimatedSize > maxSize) {
      alert(
        `Test data is too large (approximately ${(estimatedSize / 1024 / 1024).toFixed(1)} MB).\n\n` +
          `Please reduce the test size by:\n` +
          `• Reducing the number of questions\n` +
          `• Shortening question text\n` +
          `• Removing or compressing large images\n` +
          `• Splitting into multiple smaller tests`
      );
      return;
    }

    formData.set('sections', sectionsJson);
    appendTimedToFormData(formData, timedState);
    // @ts-ignore
    formAction(formData);
  };

  // AI Handler
  const handleAiGenerate = async (replaceExisting?: boolean) => {
    if (!aiTopic) return;
    setShowOverwriteConfirm(false);
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
        const timedSuffix =
          timedState.isTimed === 'timed'
            ? ` (Timed ${timedState.durationHours} Hours : ${String(timedState.durationMinutes).padStart(2, '0')} Minutes)`
            : '';
        const newSection = {
          id: Date.now(),
          title: `AI Generated: ${aiTopic}${timedSuffix}`,
          description: `${aiDifficulty} - ${aiType}`,
          questions: res.data,
        };
        setSections(
          replaceExisting || isEmptyDefaultSection(sections)
            ? [newSection]
            : [...sections, newSection]
        );
        setIsAiModalOpen(false);
        if (mode !== 'ai') setAiTopic('');
      } else {
        alert(res.error || 'Failed to generate');
      }
    } catch (e) {
      alert('Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const onGenerateTestClick = () => {
    if (hasGeneratedContent) {
      setShowOverwriteConfirm(true);
    } else {
      handleAiGenerate();
    }
  };

  // PDF Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await extractQuestionsFromPdf(formData);

      if (res.data) {
        const newSection = {
          id: Date.now(),
          title: `Imported PDF: ${e.target.files[0].name}`,
          description: 'Extracted questions',
          questions: res.data,
        };
        setSections(prev => [...prev, newSection]);
      } else {
        alert(res.error || 'Failed to extract questions');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 pb-32">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create New Test
            </h1>
            <p className="text-muted-foreground">
              Configure your test structure, sections, and questions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {mode !== 'ai' && (
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <FileUp className="h-5 w-5" />
                  )}
                  {isUploading ? 'Parsing...' : 'Upload PDF'}
                </button>
              </div>
            )}
          </div>
        </div>

        <form action={handleSubmit} className="space-y-8">
          {/* Metadata Card */}
          <div className="rounded-xl bg-card p-6 shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
              <Layers className="text-primary h-5 w-5" />
              <h2 className="text-xl font-semibold text-foreground">
                Test Configuration
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {mode === 'ai' ? (
                <input
                  type="hidden"
                  name="title"
                  value={aiTopic}
                />
              ) : (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Test Title
                  </label>
                  <input
                    name="title"
                    type="text"
                    value={testTitle}
                    onChange={e => {
                      setTestTitle(e.target.value);
                    }}
                    required
                    className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-foreground"
                    placeholder="e.g. Science Mid-Term"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Board <span className="text-destructive">*</span>
                </label>
                <select
                  name="board"
                  value={board}
                  onChange={e => {
                    setBoard(e.target.value);
                  }}
                  required
                  className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-foreground bg-card"
                >
                  <option value={BOARD_PLACEHOLDER_VALUE}>
                    {BOARD_PLACEHOLDER_LABEL}
                  </option>
                  {BOARDS.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Grade / Level
                </label>
                <select
                  name="grade"
                  value={grade}
                  onChange={e => {
                    setGrade(e.target.value);
                  }}
                  className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-foreground bg-card"
                >
                  {gradeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Subject
                </label>
                <input
                  name="subject"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-foreground"
                  placeholder="e.g. Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Visibility
                </label>
                <select
                  name="visibility"
                  className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-foreground bg-card"
                >
                  <option value="public">Public (All Students)</option>
                  <option value="private">Private (Invite Only)</option>
                </select>
              </div>

              <TestTimeLimitField value={timedState} onChange={setTimedState} />
            </div>
          </div>

          {/* Inline AI generator fields when mode=ai (no popup) */}
          {mode === 'ai' && (
            <div className="rounded-xl bg-card p-6 shadow-sm border border-border space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <Sparkles className="text-primary h-5 w-5" />
                <h2 className="text-xl font-semibold text-foreground">
                  Generate test with AI
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Set topic and options below, then click <strong>Generate Test</strong> to create questions.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Topic / Chapter
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    className="block w-full rounded-md border border-border px-3 py-2 focus:ring-primary focus:border-primary text-foreground"
                    placeholder="e.g. Newton's Laws of Motion"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Type
                  </label>
                  <select
                    value={aiType}
                    onChange={e => setAiType(e.target.value)}
                    className="block w-full rounded-md border border-border px-3 py-2 focus:ring-primary focus:border-primary text-foreground bg-card"
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={e => setAiDifficulty(e.target.value)}
                    className="block w-full rounded-md border border-border px-3 py-2 focus:ring-primary focus:border-primary text-foreground bg-card"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Number of Questions: {aiCount}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={aiCount}
                    onChange={e => setAiCount(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onGenerateTestClick}
                  disabled={isGenerating || !aiTopic}
                  className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  {hasGeneratedContent ? 'Generate new test' : 'Generate Test'}
                </button>
              </div>
            </div>
          )}

          {/* Sections Loop - hidden for mode=ai until AI has generated content */}
          {showSectionsList && (
          <div className="space-y-8">
            {sections.map((section, secIndex) => (
              <div
                key={section.id}
                className="rounded-xl bg-card border border-primary/20 shadow-md overflow-hidden"
              >
                <div className="bg-violet-light/50 p-6 border-b border-primary/20 flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <input
                      type="text"
                      value={section.title}
                      onChange={e => {
                        updateSection(secIndex, 'title', e.target.value);
                      }}
                      className="bg-transparent text-lg font-bold text-primary placeholder-primary focus:outline-none w-full"
                      placeholder="Section Title"
                    />
                    <input
                      type="text"
                      value={section.description}
                      onChange={e => {
                        updateSection(secIndex, 'description', e.target.value);
                      }}
                      className="bg-transparent text-sm text-primary placeholder-primary focus:outline-none w-full"
                      placeholder="Section Description (Optional)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeSection(secIndex);
                    }}
                    className="text-primary/60 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 overflow-x-auto">
                  <table className="min-w-full w-full table-fixed divide-y divide-border">
                    <colgroup>
                      <col className="w-0" style={{ width: '2.5rem' }} />
                      <col />
                      <col className="w-0" style={{ width: '10rem' }} />
                      <col className="w-0" style={{ width: '4.5rem' }} />
                      <col className="w-0" style={{ width: '3.5rem' }} />
                    </colgroup>
                    <thead className="bg-background">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          No.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Marks
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {section.questions.map((q: any, qIndex: number) => {
                        const questionNo =
                          sections
                            .slice(0, secIndex)
                            .reduce((acc, s) => acc + s.questions.length, 0) +
                          qIndex +
                          1;
                        return (
                          <React.Fragment key={q.id}>
                            <tr className="group align-top">
                              <td className="px-3 py-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
                                {questionNo}
                              </td>
                              <td className="px-3 py-2">
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
                                  className="block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary text-foreground min-w-0"
                                  placeholder={`Question ${questionNo}`}
                                  rows={2}
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <select
                                  value={q.type}
                                  onChange={e => {
                                    const newType = e.target.value;
                                    if (newType === 'match_columns') {
                                      const left =
                                        q.leftColumn?.length > 0
                                          ? [...(q.leftColumn || [])]
                                          : ['', ''];
                                      const right =
                                        q.options?.length > 0
                                          ? [...(q.options || [])]
                                          : ['', ''];
                                      const mapping = Array.from(
                                        { length: left.length },
                                        (_, i) =>
                                          Array.isArray(q.correctAnswer) &&
                                          typeof (q.correctAnswer as number[])[
                                            i
                                          ] === 'number'
                                            ? (q.correctAnswer as number[])[i]
                                            : Math.min(i, right.length - 1)
                                      );
                                      const newSecs = [...sections];
                                      const qu =
                                        newSecs[secIndex].questions[qIndex];
                                      newSecs[secIndex].questions[qIndex] = {
                                        ...qu,
                                        type: newType,
                                        leftColumn: left,
                                        options: right,
                                        correctAnswer: mapping,
                                      };
                                      setSections(newSecs);
                                    } else {
                                      updateQuestionExp(
                                        secIndex,
                                        qIndex,
                                        'type',
                                        newType
                                      );
                                    }
                                  }}
                                  className="block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary text-foreground bg-card min-w-0"
                                >
                                  {QUESTION_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
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
                                  className="block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary text-foreground w-16"
                                  min={1}
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeQuestionExp(secIndex, qIndex);
                                  }}
                                  className="text-muted-foreground hover:text-red-500 transition-opacity"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                            {q.type === 'mcq' && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-3 py-2 bg-background"
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    {q.options?.map(
                                      (opt: string, optIndex: number) => (
                                        <input
                                          key={optIndex}
                                          type="text"
                                          value={opt}
                                          onChange={e => {
                                            const newOpts = [
                                              ...(q.options || []),
                                            ];
                                            newOpts[optIndex] = e.target.value;
                                            updateQuestionExp(
                                              secIndex,
                                              qIndex,
                                              'options',
                                              newOpts
                                            );
                                          }}
                                          className="block w-full rounded border border-border px-2 py-1.5 text-sm text-foreground"
                                          placeholder={`Option ${optIndex + 1}`}
                                        />
                                      )
                                    )}
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
                                      className="col-span-2 block w-full rounded border border-green-200 bg-green-50 px-2 py-1.5 text-sm placeholder-green-600 text-foreground"
                                      placeholder="Correct Option (Exact Match)"
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                            {q.type === 'match_columns' && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-3 py-2 bg-background"
                                >
                                  <div className="space-y-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Column A (Left) — Column B (Right) —
                                      Correct mapping
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                          Left column (keys)
                                        </label>
                                        {(q.leftColumn || ['', '']).map(
                                          (item: string, i: number) => (
                                            <div
                                              key={i}
                                              className="flex gap-1 mb-1"
                                            >
                                              <input
                                                type="text"
                                                value={item}
                                                onChange={e => {
                                                  const arr = [
                                                    ...(q.leftColumn || [
                                                      '',
                                                      '',
                                                    ]),
                                                  ];
                                                  arr[i] = e.target.value;
                                                  updateQuestionExp(
                                                    secIndex,
                                                    qIndex,
                                                    'leftColumn',
                                                    arr
                                                  );
                                                  const ans =
                                                    (q.correctAnswer as number[]) ||
                                                    [];
                                                  if (
                                                    ans.length !== arr.length
                                                  ) {
                                                    updateQuestionExp(
                                                      secIndex,
                                                      qIndex,
                                                      'correctAnswer',
                                                      arr.map(
                                                        (_, j) => ans[j] ?? 0
                                                      )
                                                    );
                                                  }
                                                }}
                                                className="flex-1 rounded border border-border px-2 py-1.5 text-sm text-foreground"
                                                placeholder={`Item ${i + 1}`}
                                              />
                                              {(q.leftColumn?.length || 2) >
                                                1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const arr = (
                                                      q.leftColumn || ['', '']
                                                    ).filter(
                                                      (_: string, j: number) =>
                                                        j !== i
                                                    );
                                                    const mapping =
                                                      (q.correctAnswer as number[]) ||
                                                      [];
                                                    const newMapping = mapping
                                                      .filter(
                                                        (
                                                          _: number,
                                                          j: number
                                                        ) => j !== i
                                                      )
                                                      .map((v: number) =>
                                                        v >=
                                                        (q.options?.length || 0)
                                                          ? 0
                                                          : v
                                                      );
                                                    const newSecs = [
                                                      ...sections,
                                                    ];
                                                    const qu = {
                                                      ...(newSecs[secIndex]
                                                        .questions[
                                                        qIndex
                                                      ] as any),
                                                    };
                                                    qu.leftColumn = arr.length
                                                      ? arr
                                                      : [''];
                                                    qu.correctAnswer =
                                                      newMapping.length
                                                        ? newMapping
                                                        : [0];
                                                    newSecs[secIndex].questions[
                                                      qIndex
                                                    ] = qu;
                                                    setSections(newSecs);
                                                  }}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <X className="h-4 w-4" />
                                                </button>
                                              )}
                                            </div>
                                          )
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const arr = [
                                              ...(q.leftColumn || ['', '']),
                                              '',
                                            ];
                                            const mapping = [
                                              ...((q.correctAnswer as number[]) || [
                                                0,
                                              ]),
                                              0,
                                            ];
                                            updateQuestionExp(
                                              secIndex,
                                              qIndex,
                                              'leftColumn',
                                              arr
                                            );
                                            updateQuestionExp(
                                              secIndex,
                                              qIndex,
                                              'correctAnswer',
                                              mapping
                                            );
                                          }}
                                          className="text-xs text-primary hover:text-primary/90"
                                        >
                                          + Add left item
                                        </button>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                          Right column (values)
                                        </label>
                                        {(q.options || ['', '']).map(
                                          (opt: string, optIndex: number) => (
                                            <div
                                              key={optIndex}
                                              className="flex gap-1 mb-1"
                                            >
                                              <input
                                                type="text"
                                                value={opt}
                                                onChange={e => {
                                                  const arr = [
                                                    ...(q.options || ['', '']),
                                                  ];
                                                  arr[optIndex] =
                                                    e.target.value;
                                                  updateQuestionExp(
                                                    secIndex,
                                                    qIndex,
                                                    'options',
                                                    arr
                                                  );
                                                }}
                                                className="flex-1 rounded border border-border px-2 py-1.5 text-sm text-foreground"
                                                placeholder={`Option ${optIndex + 1}`}
                                              />
                                              {(q.options?.length || 2) > 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const arr = (
                                                      q.options || ['', '']
                                                    ).filter(
                                                      (_: string, j: number) =>
                                                        j !== optIndex
                                                    );
                                                    const mapping = (
                                                      (q.correctAnswer as number[]) ||
                                                      []
                                                    ).map((v: number) =>
                                                      v === optIndex
                                                        ? 0
                                                        : v > optIndex
                                                          ? v - 1
                                                          : v
                                                    );
                                                    const newSecs = [
                                                      ...sections,
                                                    ];
                                                    const qu = {
                                                      ...(newSecs[secIndex]
                                                        .questions[
                                                        qIndex
                                                      ] as any),
                                                    };
                                                    qu.options = arr.length
                                                      ? arr
                                                      : [''];
                                                    qu.correctAnswer = mapping;
                                                    newSecs[secIndex].questions[
                                                      qIndex
                                                    ] = qu;
                                                    setSections(newSecs);
                                                  }}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <X className="h-4 w-4" />
                                                </button>
                                              )}
                                            </div>
                                          )
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const arr = [
                                              ...(q.options || ['', '']),
                                              '',
                                            ];
                                            updateQuestionExp(
                                              secIndex,
                                              qIndex,
                                              'options',
                                              arr
                                            );
                                          }}
                                          className="text-xs text-primary hover:text-primary/90"
                                        >
                                          + Add right item
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Correct mapping (Column A → Column B)
                                      </label>
                                      <div className="flex flex-wrap gap-2">
                                        {(q.leftColumn || ['', '']).map(
                                          (_: string, leftIdx: number) => (
                                            <div
                                              key={leftIdx}
                                              className="flex items-center gap-1"
                                            >
                                              <span className="text-xs text-muted-foreground">
                                                {leftIdx + 1} →
                                              </span>
                                              <select
                                                value={
                                                  Array.isArray(
                                                    q.correctAnswer
                                                  ) &&
                                                  typeof (
                                                    q.correctAnswer as number[]
                                                  )[leftIdx] === 'number'
                                                    ? (
                                                        q.correctAnswer as number[]
                                                      )[leftIdx]
                                                    : 0
                                                }
                                                onChange={e => {
                                                  const mapping = [
                                                    ...((q.correctAnswer as number[]) || [
                                                      0,
                                                    ]),
                                                  ];
                                                  mapping[leftIdx] = parseInt(
                                                    e.target.value,
                                                    10
                                                  );
                                                  updateQuestionExp(
                                                    secIndex,
                                                    qIndex,
                                                    'correctAnswer',
                                                    mapping
                                                  );
                                                }}
                                                className="rounded border border-green-200 bg-green-50 px-2 py-1 text-sm text-foreground"
                                              >
                                                {(q.options || ['', '']).map(
                                                  (opt: string, ri: number) => (
                                                    <option key={ri} value={ri}>
                                                      {opt ||
                                                        `Option ${ri + 1}`}
                                                    </option>
                                                  )
                                                )}
                                              </select>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {!['mcq', 'match_columns'].includes(q.type) && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-3 py-2 bg-background"
                                >
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
                                    className="block w-full rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500 text-foreground"
                                    placeholder="Expected Answer / Key"
                                  />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        addQuestionExp(secIndex);
                      }}
                      className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Plus className="h-4 w-4" /> Add Question to{' '}
                      {section.title}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {showSectionsList && (
          <div className="flex justify-between items-center pt-8">
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium"
            >
              <Layers className="h-4 w-4" /> Add New Section
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg gradient-primary px-8 py-3 text-white shadow-lg shadow-primary/20 hover:brightness-110 hover:shadow-xl transition-all font-medium"
            >
              <Save className="h-5 w-5" /> Publish Test
            </button>
          </div>
          )}
          {mode === 'ai' && !hasGeneratedContent && (
            <p className="text-muted-foreground text-sm pt-4">
              Fill in the &quot;Generate test with AI&quot; section above and click <strong>Generate Test</strong>, then review and publish below.
            </p>
          )}
        </form>
      </div>

      <AlertDialog open={showOverwriteConfirm} onOpenChange={setShowOverwriteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing test?</AlertDialogTitle>
            <AlertDialogDescription>
              The previously generated test will be lost and a new test will be generated if you proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAiGenerate(true)}
              className="gradient-primary text-white border-0"
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Assistant Modal - only for non-AI mode (manual/pdf) if ever opened */}
      {isAiModalOpen && mode !== 'ai' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="gradient-primary p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Question Generator
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  Autogenerate questions for {board} - {grade}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAiModalOpen(false);
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Topic / Chapter
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={e => {
                    setAiTopic(e.target.value);
                  }}
                  className="block w-full rounded-md border border-border px-3 py-2 focus:ring-primary focus:border-primary text-foreground"
                  placeholder="e.g. Newton's Laws of Motion"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Type
                  </label>
                  <select
                    value={aiType}
                    onChange={e => {
                      setAiType(e.target.value);
                    }}
                    className="block w-full rounded-md border border-border px-3 py-2 focus:ring-primary focus:border-primary text-foreground bg-card"
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={e => {
                      setAiDifficulty(e.target.value);
                    }}
                    className="block w-full rounded-md border border-border px-3 py-2 focus:ring-primary focus:border-primary text-foreground bg-card"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Number of Questions: {aiCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={aiCount}
                  onChange={e => {
                    setAiCount(parseInt(e.target.value));
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <button
                onClick={() => handleAiGenerate()}
                disabled={isGenerating || !aiTopic}
                className="w-full mt-4 flex items-center justify-center gap-2 gradient-primary text-white py-3 rounded-lg hover:brightness-110 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default function CreateTestPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateTestPageContent />
    </React.Suspense>
  );
}
