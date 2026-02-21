'use client';

import { useState, useTransition } from 'react';
import { Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { searchCourseMaterial } from './actions';

interface SearchResult {
  text: string;
  score: number;
  subject: string;
  topic: string;
  board: string;
  grade: string;
  fileName: string;
  sourceType: string;
}

interface SearchMaterialProps {
  board?: string;
  grade?: string;
  subjects: string[];
}

export default function SearchMaterial({
  board,
  grade,
  subjects,
}: SearchMaterialProps) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    if (!query.trim() || query.trim().length < 3) {
      setError('Please enter at least 3 characters');
      return;
    }

    setError(null);
    startTransition(async () => {
      const response = await searchCourseMaterial(query.trim(), {
        board,
        grade,
        subject: subject || undefined,
      });

      setHasSearched(true);
      if (response.error) {
        setError(response.error);
        setResults([]);
      } else {
        setResults(response.results);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder="Search study material... (e.g. Quadratic equations, Photosynthesis)"
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
          />
        </div>
        {subjects.length > 0 && (
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="px-3 py-3 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {hasSearched && !error && results.length === 0 && (
        <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-dashed border-border">
          No results found. Try a different search term.
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {results.length} relevant result
            {results.length === 1 ? '' : 's'}
          </p>
          {results.map((result, index) => (
            <ResultCard key={`${result.fileName}-${index}`} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: SearchResult }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = result.text.length > 400;
  const displayText =
    expanded || !isLong ? result.text : result.text.slice(0, 400) + '...';

  const relevance = Math.round(result.score * 100);

  return (
    <div className="bg-card rounded-xl border-2 border-border p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {result.subject}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {result.topic}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
            relevance >= 70
              ? 'bg-green-100 text-green-800'
              : relevance >= 40
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          {relevance}% match
        </span>
      </div>

      <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
        {displayText}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> Show more
            </>
          )}
        </button>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {result.board} / {result.grade}
        </span>
        <span className="text-border">|</span>
        <span className="truncate max-w-[200px]" title={result.fileName}>
          {result.fileName}
        </span>
      </div>
    </div>
  );
}
