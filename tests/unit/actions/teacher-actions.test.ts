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
      (currentAuth as any).mockResolvedValue({ userId: null });
      const formData = new FormData();
      const result = await createTest({}, formData);
      expect(result.message).toBe('Unauthorized');
    });

    it('should fail if input validation fails', async () => {
      const { currentAuth } = await import('@/lib/auth-wrapper');
      (currentAuth as any).mockResolvedValue({ userId: 'user_123' });
      const formData = new FormData();
      // Empty form data
      const result = await createTest({}, formData);
      expect(result.message).toContain('Invalid Input');
    });

    it('should create a test successfully', async () => {
      const { currentAuth } = await import('@/lib/auth-wrapper');
      (currentAuth as any).mockResolvedValue({ userId: 'user_123' });

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
      (Question.create as any).mockResolvedValue({ _id: 'q_123' });
      (Test.create as any).mockResolvedValue({ _id: 't_123' });

      await createTest({}, formData);

      expect(Question.create).toHaveBeenCalled();
      expect(Test.create).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/teacher');

      // Verify Question creation has createdBy
      const questionCall = (Question.create as any).mock.calls[0][0];
      expect(questionCall.createdBy).toBe('user_123');

      // Verify Test creation has formatted sections
      const testCall = (Test.create as any).mock.calls[0][0];
      expect(testCall.sections[0].questions[0]).toBe('q_123');
    });
  });

  describe('updateTest', () => {
    it('should update a test successfully', async () => {
      const { currentAuth } = await import('@/lib/auth-wrapper');
      (currentAuth as any).mockResolvedValue({ userId: 'user_123' });

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

      (Question.create as any).mockResolvedValue({ _id: 'q_new' });
      (Test.findOneAndUpdate as any).mockResolvedValue({ _id: 't_existing' });

      await updateTest({}, formData);

      expect(Test.findOneAndUpdate).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/teacher');

      // Verify update logic pushes version history
      const updateCall = (Test.findOneAndUpdate as any).mock.calls[0][1];
      expect(updateCall.$push.versionHistory.action).toBe('update');
    });
  });
});
