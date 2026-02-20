'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { TUTOR_WELCOME_MESSAGE } from '@/lib/ai/tutor-config';

export function useTutorChat() {
  const pathname = usePathname();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          data: {
            currentPage: pathname,
          },
        },
      }),
    [pathname]
  );

  const chat = useChat({
    transport,
    messages: [
      {
        id: 'welcome',
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: TUTOR_WELCOME_MESSAGE }],
      },
    ],
  });

  return chat;
}
