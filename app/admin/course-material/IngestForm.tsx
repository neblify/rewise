'use client';

import { useActionState, useState, useCallback } from 'react';
import { ingestCourseMaterial } from './actions';
import { BOARDS } from '@/lib/constants/boards';
import { getGradesForBoard } from '@/lib/constants/levels';
import { Loader2, Upload, FileText, Globe } from 'lucide-react';

type SourceType = 'pdf' | 'text' | 'url';

function useIngestAction() {
  const [fileName, setFileName] = useState('');
  const [formKey, setFormKey] = useState(0);

  const wrappedAction = useCallback(
    async (prevState: unknown, formData: FormData) => {
      const result = await ingestCourseMaterial(prevState, formData);
      if (result?.message === 'success') {
        setFileName('');
        setFormKey(k => k + 1);
        alert('Material ingested successfully!');
      } else if (result?.message) {
        alert(`Error: ${result.message}`);
      }
      return result;
    },
    []
  );

  const [state, formAction, isPending] = useActionState(wrappedAction, null);
  return { state, formAction, isPending, fileName, setFileName, formKey };
}

export default function IngestForm() {
  const { formAction, isPending, fileName, setFileName, formKey } =
    useIngestAction();

  const [sourceType, setSourceType] = useState<SourceType>('pdf');
  const [board, setBoard] = useState('NIOS');
  const [grade, setGrade] = useState('A');

  const gradeOptions = getGradesForBoard(board);

  const handleBoardChange = (newBoard: string) => {
    setBoard(newBoard);
    const options = getGradesForBoard(newBoard);
    setGrade(options[0]?.value || '');
  };

  return (
    <div className="bg-card rounded-xl border-2 border-border p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">
        Ingest Course Material
      </h2>

      {/* Source Type Tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { type: 'pdf', label: 'PDF', icon: FileText },
            { type: 'text', label: 'Text / MD', icon: Upload },
            { type: 'url', label: 'URL', icon: Globe },
          ] as const
        ).map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setSourceType(type);
              setFileName('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sourceType === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <form key={formKey} action={formAction} className="space-y-4">
        <input type="hidden" name="sourceType" value={sourceType} />

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Title
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Quadratic Equations - Chapter 4"
            className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Board & Grade */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Board
            </label>
            <select
              name="board"
              value={board}
              onChange={e => handleBoardChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
            >
              {BOARDS.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Grade
            </label>
            <select
              name="grade"
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
            >
              {gradeOptions.map(g => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject & Topic */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Subject
            </label>
            <input
              name="subject"
              type="text"
              required
              placeholder="e.g. Mathematics"
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Topic
            </label>
            <input
              name="topic"
              type="text"
              required
              placeholder="e.g. Quadratic Equations"
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* File / URL Input */}
        {sourceType === 'url' ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              URL
            </label>
            <input
              name="url"
              type="url"
              required
              placeholder="https://example.com/chapter-notes"
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {sourceType === 'pdf' ? 'PDF File' : 'Text / Markdown File'}
            </label>
            <div className="relative">
              <input
                name="file"
                type="file"
                required
                accept={sourceType === 'pdf' ? '.pdf' : '.txt,.md,.text'}
                onChange={e => {
                  const file = e.target.files?.[0];
                  setFileName(file?.name || '');
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {fileName ||
                    `Choose a ${sourceType === 'pdf' ? 'PDF' : 'text'} file...`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Ingest Material
            </>
          )}
        </button>
      </form>
    </div>
  );
}
