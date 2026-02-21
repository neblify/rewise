'use client';

import { cn } from '@/lib/utils';
import { SparkleIcon } from '@/components/playful/SparkleIcon';
import type { UIMessage } from 'ai';

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text'
    )
    .map(part => part.text)
    .join('');
}

function formatContent(text: string) {
  // Simple markdown: **bold** and line breaks
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

interface MessageBubbleProps {
  message: UIMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const text = getMessageText(message);

  if (!text) return null;

  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <SparkleIcon className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border text-card-foreground'
        )}
        dangerouslySetInnerHTML={{ __html: formatContent(text) }}
      />
    </div>
  );
}
