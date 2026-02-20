'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import MessageBubble from './MessageBubble';
import type { UIMessage } from 'ai';
import type { ChatStatus } from '@/lib/ai/tutor-types';

interface ChatMessagesProps {
  messages: UIMessage[];
  status: ChatStatus;
}

export default function ChatMessages({ messages, status }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageParts = messages[messages.length - 1]?.parts;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, lastMessageParts]);

  const isWaiting =
    status === 'submitted' &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'user';

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="flex flex-col gap-4 py-4">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isWaiting && (
          <div className="flex gap-2">
            <div className="flex-shrink-0 mt-1">
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
