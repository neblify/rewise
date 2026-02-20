import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Hoist the mocks for Groq and Dependencies
const { mockedCreate } = vi.hoisted(() => {
  return { mockedCreate: vi.fn() };
});

vi.mock('groq-sdk', () => {
  return {
    default: class Groq {
      chat = {
        completions: {
          create: mockedCreate,
        },
      };
      constructor(_options: unknown) {}
    },
  };
});

// Mock pdf-parse
const mockPdfParse = vi
  .fn()
  .mockResolvedValue({ text: 'Sample PDF Text content...' });

// Mock module/createRequire
vi.mock('module', async () => {
  // We avoid importActual to prevent the "No default export" error complexity
  // We simulate what we need: createRequire
  const createRequireMock = () => (id: string) => {
    if (id === 'pdf-parse') {
      return mockPdfParse;
    }
    return {};
  };

  return {
    createRequire: createRequireMock,
    default: {
      createRequire: createRequireMock,
    },
  };
});

// Import the actions
import { generateQuestionsAI } from '@/app/teacher/create-test/ai-actions';

describe('AI Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = 'test-key';
  });

  describe('generateQuestionsAI', () => {
    it('should generate questions successfully', async () => {
      const mockAIResponse = {
        questions: [
          {
            text: 'Sample Q?',
            type: 'mcq',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            marks: 1,
          },
        ],
      };

      mockedCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockAIResponse) } }],
      });

      const result = await generateQuestionsAI(
        'Math',
        1,
        'mcq',
        'easy',
        'CBSE',
        '10'
      );

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].text).toBe('Sample Q?');
      expect(mockedCreate).toHaveBeenCalled();
    });

    it('should return error if API key is missing', async () => {
      delete process.env.GROQ_API_KEY;
      const result = await generateQuestionsAI(
        'Math',
        1,
        'mcq',
        'easy',
        'CBSE',
        '10'
      );
      expect(result.error).toContain('Missing Key');
    });

    it('should handle API errors gracefully', async () => {
      mockedCreate.mockRejectedValueOnce(new Error('API Failure'));
      const result = await generateQuestionsAI(
        'Math',
        1,
        'mcq',
        'easy',
        'CBSE',
        '10'
      );
      expect(result.error).toBeDefined();
    });
  });

  // Note: PDF extraction tests might fail if 'createRequire' isn't fully mocked for the server action context in Vitest.
  // If this specific test fails due to 'require' issues, we might need to adjust the mock or skip it for now.
  // However, since we polyfilled logic in the source file, let's try.
  // Actually, 'extractQuestionsFromPdf' uses `formData` and `require('pdf-parse')` inside.
  // Our mock above for `module` attempts to handle `createRequire`.

  // Changing approach slightly: Since the source uses `createRequire(import.meta.url)(...)`,
  // mocking that exact chain is tricky.
  // Simplified test for generateQuestionsAI first.
});
