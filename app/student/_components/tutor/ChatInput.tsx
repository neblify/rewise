'use client';

import type { KeyboardEvent, FormEvent } from 'react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Square } from 'lucide-react';
import type { ChatStatus } from '@/lib/ai/tutor-types';

interface ChatInputProps {
  onSend: (text: string) => void;
  status: ChatStatus;
  stop: () => void;
}

export default function ChatInput({ onSend, status, stop }: ChatInputProps) {
  const [input, setInput] = useState('');

  const isBusy = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isBusy) {
      onSend(input.trim());
      setInput('');
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isBusy) {
        onSend(input.trim());
        setInput('');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border p-3 flex gap-2 items-end"
    >
      <Textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask me anything..."
        className="min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl"
        rows={1}
      />
      {isBusy ? (
        <Button
          type="button"
          onClick={stop}
          size="icon"
          variant="outline"
          className="flex-shrink-0 rounded-xl"
        >
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          variant="gradient"
          className="flex-shrink-0 rounded-xl"
          disabled={!input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
