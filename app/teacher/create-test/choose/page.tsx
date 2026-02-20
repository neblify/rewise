'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, PenLine, FileUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Choice = 'ai' | 'manual' | 'pdf';

const OPTIONS: {
  value: Choice;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'ai',
    label: 'Use AI to generate a test',
    description: 'Generate questions from a topic using the AI Assistant.',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    value: 'manual',
    label: 'Create my own test',
    description: 'Build your test manually with sections and questions.',
    icon: <PenLine className="h-6 w-6" />,
  },
  {
    value: 'pdf',
    label: 'PDF \u2192 Test',
    description: 'Upload a PDF and convert it into a test.',
    icon: <FileUp className="h-6 w-6" />,
  },
];

export default function ChooseTestTypePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Choice | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push(`/teacher/create-test?mode=${selected}`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Create New Test
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose how you want to create your test.
          </p>
        </div>

        <div className="space-y-3">
          {OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-start gap-4 rounded-xl border-2 p-5 cursor-pointer transition-colors ${
                selected === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="testType"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-primary shrink-0 mt-0.5">{opt.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground">
                  {opt.label}
                </span>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {opt.description}
                </p>
              </div>
              <ArrowRight
                className={`h-5 w-5 shrink-0 text-muted-foreground ${
                  selected === opt.value ? 'text-primary' : ''
                }`}
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/teacher">Cancel</Link>
          </Button>
          <Button
            variant="gradient"
            onClick={handleContinue}
            disabled={!selected}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
