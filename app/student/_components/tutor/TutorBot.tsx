'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SparkleIcon } from '@/components/playful/SparkleIcon';
import { RotateCcw } from 'lucide-react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useTutorChat } from './useTutorChat';
import { TUTOR_NAME, TUTOR_WELCOME_MESSAGE } from '@/lib/ai/tutor-config';
import type { ChatStatus } from '@/lib/ai/tutor-types';

export default function TutorBot() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { messages, sendMessage, stop, status, setMessages } = useTutorChat();

  // Hide during active test-taking
  const isTestPage = pathname.startsWith('/student/test/');
  if (isTestPage) return null;

  const handleNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text' as const, text: TUTOR_WELCOME_MESSAGE }],
      },
    ]);
  };

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  return (
    <TooltipProvider>
      {/* Floating Action Button */}
      {!open && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg gradient-primary hover:scale-105 transition-transform"
              size="icon"
              aria-label="Open tutor"
            >
              <SparkleIcon className="h-6 w-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Ask the {TUTOR_NAME}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Chat Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] md:w-[440px] p-0 flex flex-col [&>button]:hidden"
        >
          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b gradient-primary text-white space-y-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-white text-base">
                <SparkleIcon className="h-5 w-5 text-white" />
                {TUTOR_NAME}
              </SheetTitle>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNewChat}
                      className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Chat</TooltipContent>
                </Tooltip>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
            </div>
            <SheetDescription className="text-white/70 text-xs">
              I guide you to answers through questions
            </SheetDescription>
          </SheetHeader>

          {/* Messages */}
          <ChatMessages messages={messages} status={status as ChatStatus} />

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            status={status as ChatStatus}
            stop={stop}
          />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
