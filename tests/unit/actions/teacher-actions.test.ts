import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTest, updateTest } from '@/app/teacher/create-test/actions';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import { redirect } from 'next/navigation';

// Mock Dependencies
vi.mock('@/lib/auth-wrapper', () => ({
  currentAuth: vi.fn(),
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
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Question', () => ({
  default: {
    create: vi.fn(),
  },
}));

describe('Teacher Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTest', () => {
    it('should fail if user is not authenticated', async () => {
      const { currentAuth } = await import('@/lib/auth-wrapper');
      vi.mocked(currentAuth).mockResolvedValue({
        userId: null,
      } as unknown as Awaited<ReturnType<typeof currentAuth>>);
      const formData = new FormData();
      const result = await createTest({}, formData);
      expect(result.message).toBe('Unauthorized');
    });

    it('should fail if input validation fails', async () => {
      const { currentAuth } = await import('@/lib/auth-wrapper');
      vi.mocked(currentAuth).mockResolvedValue({
        userId: 'user_123',
      } as unknown as Awaited<ReturnType<typeof currentAuth>>);
      const formData = new FormData();
      // Empty form data
      const result = await createTest({}, formData);
      expect(result.message).toContain('Invalid Input');
    });

    it('should create a test successfully', async () => {
      const { currentAuth } = await import('@/lib/auth-wrapper');
      vi.mocked(currentAuth).mockResolvedValue({
        userId: 'user_123',
      } as unknown as Awaited<ReturnType<typeof currentAuth>>);

      const formData = new FormData();
      formData.append('title', 'Math Final');
      formData.append('subject', 'Math');
      formData.append('board', 'CBSE');
      formData.append('grade', '10');
      formData.append('visibility', 'public');
      formData.append('isTimed', 'false');
      formData.append('durationHours', '1');
      formData.append('durationMinutes', '30');

      const sections = [
        {
          title: 'Section A',
          questions: [{ text: 'Q1', type: 'mcq', marks: 1 }],
        },
      ];
      formData.append('sections', JSON.stringify(sections));

      // Mock DB responses
      vi.mocked(Question.create).mockResolvedValue({ _id: 'q_123' } as never);
      vi.mocked(Test.create).mockResolvedValue({ _id: 't_123' } as never);

      await createTest({}, formData);

      expect(Question.create).toHaveBeenCalled();
      expect(Test.create).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/teacher');

      // Verify Question creation has createdBy
      const questionCall = vi.mocked(Question.create).mock.calls[0][0];
      expect((questionCall as Record<string, unknown>).createdBy).toBe(
        'user_123'
      );

      // Verify Test creation has formatted sections
      const testCall = vi.mocked(Test.create).mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(
        (testCall.sections as Array<{ questions: string[] }>)[0].questions[0]
      ).toBe('q_123');
    });
  });

  describe('updateTest', () => {
    it('should update a test successfully', async () => {
      const { currentAuth } = await import('@/lib/auth-wrapper');
      vi.mocked(currentAuth).mockResolvedValue({
        userId: 'user_123',
      } as unknown as Awaited<ReturnType<typeof currentAuth>>);

      const formData = new FormData();
      formData.append('testId', 't_existing');
      formData.append('title', 'Math Final Updated');
      formData.append('subject', 'Math');
      formData.append('board', 'CBSE');
      formData.append('grade', '10');
      formData.append('visibility', 'public');
      formData.append('isTimed', 'false');
      formData.append('durationHours', '1');
      formData.append('durationMinutes', '30');

      const sections = [
        {
          title: 'Section A',
          questions: [{ text: 'Q1 New', type: 'mcq', marks: 1 }],
        },
      ];
      formData.append('sections', JSON.stringify(sections));

      vi.mocked(Question.create).mockResolvedValue({ _id: 'q_new' } as never);
      vi.mocked(Test.findOneAndUpdate).mockResolvedValue({
        _id: 't_existing',
      } as never);

      await updateTest({}, formData);

      expect(Test.findOneAndUpdate).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/teacher');

      // Verify update logic pushes version history
      const updateCall = vi.mocked(Test.findOneAndUpdate).mock
        .calls[0][1] as Record<string, Record<string, unknown>>;
      expect(
        (updateCall.$push.versionHistory as Record<string, unknown>).action
      ).toBe('update');
    });
  });
});
