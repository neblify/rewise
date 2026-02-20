import { streamText, convertToModelMessages } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Result from '@/lib/db/models/Result';
import {
  buildTutorSystemPrompt,
  type TutorContext,
} from '@/lib/ai/tutor-system-prompt';
import { queryRelevantChunks } from '@/lib/vector/operations';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(request: Request) {
  try {
    const { userId } = await currentAuth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { messages, data } = await request.json();
    const currentPage = data?.currentPage as string | undefined;

    await dbConnect();

    // Fetch student profile
    const user = await User.findOne({ clerkId: userId }).lean();
    const studentName = user?.firstName || '';
    const board = user?.board || '';
    const grade = user?.grade || '';

    // Fetch recent weak areas from test results
    const recentResults = await Result.find({ studentId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('weakAreas')
      .lean();

    const weakAreas = [
      ...new Set(recentResults.flatMap(r => r.weakAreas || [])),
    ];

    // RAG: search curriculum material for context (graceful fallback)
    let ragChunks: string[] = [];
    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === 'user') as
      | { role: string; parts?: { type: string; text?: string }[] }
      | undefined;

    // Extract text from UIMessage parts format
    const lastUserText = lastUserMessage?.parts
      ?.filter((p: { type: string }) => p.type === 'text')
      .map((p: { text?: string }) => p.text || '')
      .join('');

    if (lastUserText && (board || grade)) {
      try {
        const chunks = await queryRelevantChunks(
          lastUserText,
          { board, grade },
          3
        );
        ragChunks = chunks
          .filter(c => c.score > 0.5)
          .map(c => c.text.slice(0, 500));
      } catch {
        // Upstash Vector not configured or unavailable — continue without RAG
      }
    }

    // Build system prompt with full student context
    const tutorContext: TutorContext = {
      studentName,
      board,
      grade,
      weakAreas,
      currentPage,
      ragChunks: ragChunks.length > 0 ? ragChunks : undefined,
    };

    const systemPrompt = buildTutorSystemPrompt(tutorContext);

    // Limit conversation history to last 20 messages to manage token budget
    const trimmedMessages = messages.slice(-20);

    // Convert UIMessages (parts format) to ModelMessages (content format) for streamText
    const modelMessages = await convertToModelMessages(trimmedMessages);

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
