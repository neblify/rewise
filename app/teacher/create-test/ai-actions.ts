'use server';

import Groq from 'groq-sdk';
import { parsePdfToText } from '@/lib/pdf/parse';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STATIC_BOARD_SOURCE_WEBSITES: Record<string, string> = {
  IGCSE:
    'Look up https://www.cie.org.uk/ and https://www.cambridge.org/ to generate the questions.',
  CBSE: 'Look up sources endorsed by NCERT syllabuses at https://ncert.nic.in/ to generate the questions.',
  IB: 'Look up https://www.ibo.org/ to generate the questions.',
  SSC: 'Look up https://ssc.nic.in/ to generate the questions.',
  NIOS: 'Look up https://nios.ac.in/ to generate the questions.',
};

export async function extractQuestionsFromPdf(formData: FormData) {
  if (!process.env.GROQ_API_KEY) {
    return { error: 'AI Service Unavailable (Missing Key)' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided' };
  }

  try {
    const text = await parsePdfToText(file);

    // Truncate text if too long to avoid token limits (rudimentary check)
    // 50k chars is usually safe for large context models, but being safe.
    const truncatedText = text.slice(0, 30000);

    const prompt = `
        You are an expert exam setter. 
        Analyze the following text extracted from a PDF and identify all the questions present.
        
        Text Content:
        """
        ${truncatedText}
        """
        
        Output must be a strictly valid JSON array of question objects matching this TypeScript interface:
        
        interface Question {
            text: string;
            type: string; // Infer from context. Options: 'mcq', 'fill_in_blanks', 'true_false', 'match_columns', 'single_word', 'brief_answer', 'difference'
            options?: string[]; // Required for 'mcq'
            correctAnswer: string; // Infer if possible, else leave empty string
            marks: number; // Infer or default to 1
        }

        Notes:
        - If multiple choice, put options in 'options' array.
        - Clean up any scanning artifacts or weird spacing.
        - If no questions found, return empty array [].
        
        Respond ONLY with the JSON array.
        `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that extracts exam questions in strict JSON format.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    console.log('PDF Extraction Result:', content);

    if (!content) throw new Error('No content from AI');

    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];

    const sanitizedQuestions = questions.map((q: Record<string, unknown>) => ({
      id: Date.now() + Math.random(),
      text: q.text as string,
      type: (q.type as string) || 'brief_answer',
      options: (q.options as string[]) || [],
      correctAnswer: (q.correctAnswer as string) || '',
      marks: (q.marks as number) || 1,
    }));

    return { data: sanitizedQuestions };
  } catch (error) {
    console.error('PDF Parse Error:', error);
    return { error: 'Failed to extract questions from PDF.' };
  }
}

export async function generateQuestionsAI(
  topic: string,
  count: number,
  type: string,
  difficulty: string,
  board: string,
  grade: string
) {
  if (!process.env.GROQ_API_KEY) {
    return { error: 'AI Service Unavailable (Missing Key)' };
  }

  // RAG: Retrieve relevant course material for context
  let courseContext = '';
  try {
    if (process.env.UPSTASH_VECTOR_REST_URL) {
      const { queryRelevantChunks } = await import('@/lib/vector/operations');
      const chunks = await queryRelevantChunks(topic, { board, grade }, 5);
      if (chunks.length > 0) {
        courseContext = chunks.map(c => c.text).join('\n\n---\n\n');
      }
    }
  } catch (e) {
    console.warn('RAG context retrieval failed:', e);
  }

  let sourceWebsites = STATIC_BOARD_SOURCE_WEBSITES[board];
  if (board === 'ICSE') {
    sourceWebsites =
      grade === '10' || grade === '12'
        ? 'Look up https://www.icse.org/ and https://www.cisce.org/ to generate the questions.'
        : 'Use ICSE curriculum guidelines to generate the questions.';
  }
  if (!sourceWebsites) {
    sourceWebsites = `Use ${board} Board curriculum guidelines to generate the questions.`;
  }

  const prompt = `
    You are an expert exam setter for ${board} Board, Grade ${grade}.
    Generate ${count} ${difficulty} questions on the topic: "${topic}".
    ${courseContext ? `\n    Use the following course material as reference for generating accurate, curriculum-aligned questions:\n    """\n    ${courseContext.slice(0, 15000)}\n    """` : ''}

    Question Type: ${type}

    ${sourceWebsites}

    Output must be a strictly valid JSON array of question objects matching this TypeScript interface:

    When the subject is mentioned as 'Math' or 'Maths' or 'Mathematics', then show some questions which involve mathematical concepts and operations where the candidate needs to calculate the answer.
  
    interface Question {
        text: string;
        type: string; // Must be one of: 'mcq', 'fill_in_blanks', 'true_false', 'match_columns', 'single_word', 'brief_answer'
        options?: string[]; // Required for 'mcq' (4 options)
        correctAnswer: string; 
        marks: number; // Suggest marks based on difficulty (1-5)
    }

    Notes:
    - For 'mcq', provide 4 options in 'options' array.
    - For 'true_false', options should be ignored, correctAnswer must be "True" or "False".
    - For 'match_columns', provide pairs in 'options' array as "Key - Value" (e.g. ["Father - The male parent", "Mother - The female parent"]). One string per pair; we will split into left column (keys) and right column (values).
    - Ensure questions are academic and appropriate.
    
    Respond ONLY with the JSON array.
    `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates exam questions in strict JSON format.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    console.log('AI Generation Result:', content);

    if (!content) throw new Error('No content');

    const parsed = JSON.parse(content);

    // Handle if AI returns { questions: [...] } or just [...]
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];

    // Post-processing to ensure compatibility
    const sanitizedQuestions = questions.map((q: Record<string, unknown>) => {
      const effectiveType = type === 'mixed' ? (q.type as string) : type;
      if (
        effectiveType === 'match_columns' &&
        Array.isArray(q.options) &&
        q.options.length > 0
      ) {
        // Parse "Key - Value" strings into keys and values
        const keys: string[] = [];
        const values: string[] = [];
        const separator = ' - ';
        for (const pair of q.options as string[]) {
          const str = String(pair).trim();
          const idx = str.indexOf(separator);
          if (idx !== -1) {
            keys.push(str.slice(0, idx).trim());
            values.push(str.slice(idx + separator.length).trim());
          } else {
            keys.push('');
            values.push(str);
          }
        }
        const n = keys.length;
        const shuffle = <T>(arr: T[]): T[] => {
          const out = [...arr];
          for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [out[i], out[j]] = [out[j], out[i]];
          }
          return out;
        };
        const leftOrder = shuffle(Array.from({ length: n }, (_, i) => i));
        const rightOrder = shuffle(Array.from({ length: n }, (_, i) => i));
        const leftColumn = leftOrder.map(i => keys[i]);
        const options = rightOrder.map(i => values[i]);
        // correctAnswer[i] = index in options (right column) that matches leftColumn[i]
        const correctAnswer = leftOrder.map(keyIdx =>
          rightOrder.indexOf(keyIdx)
        );
        return {
          id: Date.now() + Math.random(),
          text: q.text as string,
          type: effectiveType,
          leftColumn,
          options,
          correctAnswer,
          marks: (q.marks as number) || 1,
        };
      }
      return {
        id: Date.now() + Math.random(),
        text: q.text as string,
        type: effectiveType,
        options: (q.options as string[]) || [],
        correctAnswer: q.correctAnswer as string,
        marks: (q.marks as number) || 1,
      };
    });

    return { data: sanitizedQuestions };
  } catch (error) {
    console.error('AI Gen Error:', error);
    return { error: 'Failed to generate questions. Please try again.' };
  }
}
