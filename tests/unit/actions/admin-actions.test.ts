import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAdminStats,
  getUsers,
  getTests,
  getQuestions,
} from '@/app/admin/actions';
import User from '@/lib/db/models/User';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';

// Mock DB Connect
vi.mock('@/lib/db/connect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

// Mock Models
vi.mock('@/lib/db/models/User', () => ({
  default: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Test', () => ({
  default: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Question', () => ({
  default: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Result', () => ({
  default: {
    countDocuments: vi.fn(),
  },
}));

describe('Admin Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminStats', () => {
    it('should return correct counts', async () => {
      vi.mocked(User.countDocuments).mockImplementation((query: unknown) => {
        const q = query as { role?: string };
        if (q.role === 'teacher') return Promise.resolve(10) as never;
        if (q.role === 'student') return Promise.resolve(100) as never;
        if (q.role === 'parent') return Promise.resolve(50) as never;
        return Promise.resolve(0) as never;
      });
      vi.mocked(Test.countDocuments).mockResolvedValue(5 as never);
      vi.mocked(Question.countDocuments).mockResolvedValue(50 as never);
      vi.mocked(Result.countDocuments).mockResolvedValue(200 as never);

      const stats = await getAdminStats();

      expect(stats).toEqual({
        teachers: 10,
        students: 100,
        parents: 50,
        tests: 5,
        questions: 50,
        results: 200,
      });
    });
  });

  describe('getUsers', () => {
    it('should fetch all users sorted by date', async () => {
      const mockUsers = [{ firstName: 'John' }];
      const mockSort = vi.fn().mockResolvedValue(mockUsers);
      vi.mocked(User.find).mockReturnValue({
        sort: mockSort,
      } as unknown as ReturnType<typeof User.find>);

      const result = await getUsers();

      expect(User.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockUsers);
    });

    it('should fetch users filtered by role', async () => {
      const mockUsers = [{ firstName: 'John', role: 'teacher' }];
      const mockSort = vi.fn().mockResolvedValue(mockUsers);
      vi.mocked(User.find).mockReturnValue({
        sort: mockSort,
      } as unknown as ReturnType<typeof User.find>);

      const result = await getUsers('teacher');

      expect(User.find).toHaveBeenCalledWith({ role: 'teacher' });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getTests', () => {
    it('should fetch all tests sorted by date', async () => {
      const mockTests = [{ title: 'Math Test' }];
      const mockSort = vi.fn().mockResolvedValue(mockTests);
      vi.mocked(Test.find).mockReturnValue({
        sort: mockSort,
      } as unknown as ReturnType<typeof Test.find>);

      const result = await getTests();

      expect(Test.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockTests);
    });
  });

  describe('getQuestions', () => {
    it('should fetch latest 100 questions', async () => {
      const mockQuestions = [{ text: 'Q1' }];
      const mockLimit = vi.fn().mockResolvedValue(mockQuestions);
      const mockSort = vi.fn().mockReturnValue({ limit: mockLimit });
      vi.mocked(Question.find).mockReturnValue({
        sort: mockSort,
      } as unknown as ReturnType<typeof Question.find>);

      const result = await getQuestions();

      expect(Question.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockLimit).toHaveBeenCalledWith(100);
      expect(result).toEqual(mockQuestions);
    });
  });
});
