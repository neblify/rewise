import { describe, it, expect, vi, beforeEach } from 'vitest';

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

            constructor(options: any) {
                // constructor logic if needed
            }
        },
    };
});

// Import after mock
import { gradeTestWithAI } from '@/lib/ai/grader';

describe('gradeTestWithAI', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully grade a test and return parsed results', async () => {
        const mockTest = {
            title: 'Math Test',
            subject: 'Math',
            sections: [
                {
                    title: 'Section A',
                    questions: [
                        { text: '2+2?', type: 'mcq', correctAnswer: '4', marks: 1 }
                    ]
                }
            ]
        };
        const mockAnswers = { '0-0': '4' };

        const mockAIResponse = {
            results: [
                { questionId: '0-0', isCorrect: true, marksObtained: 1, feedback: 'Correct' }
            ],
            totalMarksObtained: 1,
            maxMarks: 1,
            weakAreas: [],
            overallFeedback: 'Good job'
        };

        mockedCreate.mockResolvedValueOnce({
            choices: [
                {
                    message: {
                        content: JSON.stringify(mockAIResponse)
                    }
                }
            ]
        });

        const result = await gradeTestWithAI(mockTest, mockAnswers);

        expect(result).toEqual(mockAIResponse);
        expect(mockedCreate).toHaveBeenCalledTimes(1);

        // precise verification of arguments can be complex due to the large prompt string,
        // but we can check if it contains key info
        const callArgs = mockedCreate.mock.calls[0][0];
        expect(callArgs.messages[1].content).toContain('Math Test');
        expect(callArgs.messages[1].content).toContain('2+2?');
    });

    it('should handle legacy test structure (no sections)', async () => {
        const mockTest = {
            title: 'Math Test',
            subject: 'Math',
            questions: [
                { text: '2+2?', type: 'mcq', correctAnswer: '4', marks: 1 }
            ]
        };
        const mockAnswers = { '0': '4' };

        const mockAIResponse = {
            results: [
                { questionId: '0', isCorrect: true, marksObtained: 1, feedback: 'Correct' }
            ],
            totalMarksObtained: 1,
            maxMarks: 1,
            weakAreas: [],
            overallFeedback: 'Good job'
        };

        mockedCreate.mockResolvedValueOnce({
            choices: [
                {
                    message: {
                        content: JSON.stringify(mockAIResponse)
                    }
                }
            ]
        });

        const result = await gradeTestWithAI(mockTest, mockAnswers);

        expect(result).toEqual(mockAIResponse);
    });

    it('should return null when AI fails or returns empty content', async () => {
        const mockTest = { title: 'Test', subject: 'Math', questions: [] };

        // Mock error
        mockedCreate.mockRejectedValueOnce(new Error('API Error'));

        const result = await gradeTestWithAI(mockTest, {});
        expect(result).toBeNull();
    });

    it('should handle logic for fill_in_blanks normalization', async () => {
        const mockTest = {
            title: 'English Test',
            subject: 'English',
            sections: [
                {
                    title: 'Section A',
                    questions: [
                        { text: 'The sky is ___', type: 'fill_in_blanks', correctAnswer: 'Blue', marks: 1 }
                    ]
                }
            ]
        };
        // Student answers "blue " (lowercase + space), should be normalized to match "Blue"
        // The code says if loosely match, replace student answer with EXACT correct answer
        const mockAnswers = { '0-0': 'blue ' };

        mockedCreate.mockResolvedValueOnce({
            choices: [{ message: { content: '{}' } }]
        });

        await gradeTestWithAI(mockTest, mockAnswers);

        const callArgs = mockedCreate.mock.calls[0][0];
        const promptSnippet = callArgs.messages[1].content;

        // We need to verify the JSON part passed in the prompt
        // Extract JSON string from prompt
        const jsonStart = promptSnippet.indexOf('Questions & Answers:') + 'Questions & Answers:'.length;
        const jsonEnd = promptSnippet.indexOf('Output Format');
        const jsonStr = promptSnippet.substring(jsonStart, jsonEnd).trim();
        const promptParams = JSON.parse(jsonStr);

        expect(promptParams[0].studentAnswer).toBe('Blue');
    });
});
