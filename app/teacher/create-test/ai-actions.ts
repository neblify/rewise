'use server';

import Groq from 'groq-sdk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Polyfills for pdf-parse / pdfjs-dist in Node environment
// @ts-ignore
if (typeof Promise.withResolvers === 'undefined') {
  // @ts-ignore
  if (typeof window !== 'undefined') {
    // browser logic (unlikely here)
  } else {
    // Node polyfills
    // @ts-ignore
    global.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
}

// Global mocks for DOM APIs required by pdfjs-dist legacy builds
// @ts-ignore
if (!global.DOMMatrix) {
  // @ts-ignore
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      // @ts-ignore
      this.a = 1;
      // @ts-ignore
      this.b = 0;
      // @ts-ignore
      this.c = 0;
      // @ts-ignore
      this.d = 1;
      // @ts-ignore
      this.e = 0;
      // @ts-ignore
      this.f = 0;
    }
    multiply() {
      return this;
    }
    translate() {
      return this;
    }
    scale() {
      return this;
    }
    transformPoint(p: any) {
      return p;
    }
  };
}
// @ts-ignore
if (!global.ImageData) {
  // @ts-ignore
  global.ImageData = class ImageData {
    constructor(width: number, height: number) {
      // @ts-ignore
      this.width = width;
      // @ts-ignore
      this.height = height;
      // @ts-ignore
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  };
}
// @ts-ignore
if (!global.Path2D) {
  // @ts-ignore
  global.Path2D = class Path2D {};
}

// pdf-parse require moved inside extractQuestionsFromPdf to avoid top-level execution side-effects

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function extractQuestionsFromPdf(formData: FormData) {
  if (!process.env.GROQ_API_KEY) {
    return { error: 'AI Service Unavailable (Missing Key)' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided' };
  }

  try {
    const pdf = require('pdf-parse');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf(buffer);
    const text = data.text;

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

    const sanitizedQuestions = questions.map((q: any) => ({
      id: Date.now() + Math.random(),
      text: q.text,
      type: q.type || 'brief_answer',
      options: q.options || [],
      correctAnswer: q.correctAnswer || '',
      marks: q.marks || 1,
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

  const prompt = `
    You are an expert exam setter for ${board} Board, Grade ${grade}.
    Generate ${count} ${difficulty} questions on the topic: "${topic}".
    
    Question Type: ${type}

    When 'IGCSE' is selected as the Board, lookup to the website https://www.cie.org.uk/ and https://www.cambridge.org/ to generate the questions.
    
    When 'CBSE' is selected as the Board, lookup to the sources endorsed by NCERT syllabuses available on the website https://ncert.nic.in/ to generate the questions.
    
    When 'IB' is selected as the Board, lookup to the website https://www.ibo.org/ to generate the questions.

    When 'ICSE' is selected as the Board and the selected grade or class is 10th or 12th, then lookup to the website https://www.icse.org/ and https://www.cisce.org/ to generate the questions.

    When 'SSC' is selected as the Board, lookup to the website https://ssc.nic.in/ to generate the questions.

    When 'NIOS' is selected as the Board, lookup to the website https://nios.ac.in/ to generate the questions.

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
    const sanitizedQuestions = questions.map((q: any) => {
      const effectiveType = type === 'mixed' ? q.type : type;
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
          text: q.text,
          type: effectiveType,
          leftColumn,
          options,
          correctAnswer,
          marks: q.marks || 1,
        };
      }
      return {
        id: Date.now() + Math.random(),
        text: q.text,
        type: effectiveType,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
      };
    });

    return { data: sanitizedQuestions };
  } catch (error) {
    console.error('AI Gen Error:', error);
    return { error: 'Failed to generate questions. Please try again.' };
  }
}
