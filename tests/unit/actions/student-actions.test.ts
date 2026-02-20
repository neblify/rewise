import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitTest } from '@/app/student/test/[id]/actions';
import { auth } from '@clerk/nextjs/server';
import Test from '@/lib/db/models/Test';
import Result from '@/lib/db/models/Result';
import { gradeTestWithAI } from '@/lib/ai/grader';

// Mock Dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/connect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Models
vi.mock('@/lib/db/models/Test', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Result', () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Question', () => ({
  default: {},
}));

// Mock Grader
vi.mock('@/lib/ai/grader', () => ({
  gradeTestWithAI: vi.fn(),
}));

describe('Student Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitTest', () => {
    it('should fail if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: null,
      } as unknown as Awaited<ReturnType<typeof auth>>);
      const result = await submitTest('test_123', {});
      expect(result.message).toBe('Unauthorized');
    });

    it('should fail if test is not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'student_123',
      } as unknown as Awaited<ReturnType<typeof auth>>);

      const mockPopulate = vi
        .fn()
        .mockReturnValue({ populate: vi.fn().mockResolvedValue(null) });
      vi.mocked(Test.findById).mockReturnValue({
        populate: mockPopulate,
      } as unknown as ReturnType<typeof Test.findById>);

      const result = await submitTest('test_invalid', {});
      expect(result.message).toBe('Test not found');
    });

    it('should submit and grade test successfully', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'student_123',
      } as unknown as Awaited<ReturnType<typeof auth>>);

      const mockTest = { _id: 'test_123', title: 'Math Test' };
      const mockPopulate2 = vi.fn().mockResolvedValue(mockTest);
      const mockPopulate1 = vi
        .fn()
        .mockReturnValue({ populate: mockPopulate2 });
      vi.mocked(Test.findById).mockReturnValue({
        populate: mockPopulate1,
      } as unknown as ReturnType<typeof Test.findById>);

      // Mock grading result
      const mockGradingResult = {
        results: [
          {
            questionId: 'q1',
            isCorrect: true,
            marksObtained: 1,
            feedback: 'Correct',
          },
        ],
        totalMarksObtained: 1,
        maxMarks: 1,
        weakAreas: [],
        overallFeedback: 'Good',
      };
      vi.mocked(gradeTestWithAI).mockResolvedValue(mockGradingResult);

      vi.mocked(Result.create).mockResolvedValue({
        _id: 'result_123',
      } as never);

      const result = await submitTest('test_123', { q1: 'Answer' });

      expect(gradeTestWithAI).toHaveBeenCalledWith(mockTest, { q1: 'Answer' });
      expect(Result.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.resultId).toBe('result_123');

      // Verify what was saved to Result
      const saveCall = vi.mocked(Result.create).mock.calls[0][0];
      expect(saveCall.studentId).toBe('student_123');
      expect(saveCall.totalScore).toBe(1);
      expect(saveCall.answers[0].questionId).toBe('q1');
    });

    it('should return error if grading fails', async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: 'student_123',
      } as unknown as Awaited<ReturnType<typeof auth>>);

      const mockTest = { _id: 'test_123' };
      const mockPopulate2 = vi.fn().mockResolvedValue(mockTest);
      const mockPopulate1 = vi
        .fn()
        .mockReturnValue({ populate: mockPopulate2 });
      vi.mocked(Test.findById).mockReturnValue({
        populate: mockPopulate1,
      } as unknown as ReturnType<typeof Test.findById>);

      vi.mocked(gradeTestWithAI).mockResolvedValue(null);

      const result = await submitTest('test_123', {});
      expect(result.message).toBe('Grading failed');
    });
  });
});
