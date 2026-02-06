import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStudentResults, getLinkedStudents } from '@/app/parent/actions';
import { auth } from '@clerk/nextjs/server';
import User from '@/lib/db/models/User';
import Result from '@/lib/db/models/Result';

// Mock Dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/connect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

// Mock Models
vi.mock('@/lib/db/models/User', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Result', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('@/lib/db/models/Test', () => ({
  default: {},
}));

describe('Parent Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudentResults', () => {
    it('should fail if user is not authenticated', async () => {
      (auth as any).mockResolvedValue({ userId: null });
      const result = await getStudentResults('student@example.com');
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error if student not found', async () => {
      (auth as any).mockResolvedValue({ userId: 'parent_123' });
      (User.findOne as any).mockResolvedValue(null);

      const result = await getStudentResults('unknown@example.com');
      expect(result.error).toBe('Student not found with this email.');
    });

    it('should link student and return results successfully', async () => {
      (auth as any).mockResolvedValue({ userId: 'parent_123' });

      const mockStudent = {
        clerkId: 'student_123',
        email: 'student@example.com',
      };
      (User.findOne as any).mockResolvedValue(mockStudent);

      const mockResults = [{ score: 10, testId: { title: 'Math Test' } }];

      // Mock Result chain: find -> populate -> sort
      const mockSort = vi.fn().mockResolvedValue(mockResults);
      const mockPopulate = vi.fn().mockReturnValue({ sort: mockSort });
      (Result.find as any).mockReturnValue({ populate: mockPopulate });

      const result = await getStudentResults('student@example.com');

      // Verify linking
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: 'parent_123' },
        { $addToSet: { children: 'student_123' } },
        { upsert: true }
      );

      // Verify result fetching
      expect(Result.find).toHaveBeenCalledWith({ studentId: 'student_123' });
      expect(result.data).toEqual(mockResults);
    });
  });

  describe('getLinkedStudents', () => {
    it('should fail if user is not authenticated', async () => {
      (auth as any).mockResolvedValue({ userId: null });
      const result = await getLinkedStudents();
      expect(result.error).toBe('Unauthorized');
    });

    it('should return empty list if parent has no children', async () => {
      (auth as any).mockResolvedValue({ userId: 'parent_NO_KIDS' });
      (User.findOne as any).mockResolvedValue({ children: [] });

      const result = await getLinkedStudents();
      expect(result.data).toEqual([]);
    });

    it('should return linked students details', async () => {
      (auth as any).mockResolvedValue({ userId: 'parent_123' });
      const mockParent = { children: ['child_1', 'child_2'] };
      (User.findOne as any).mockResolvedValue(mockParent);

      const mockChildrenDetails = [
        { firstName: 'A', clerkId: 'child_1' },
        { firstName: 'B', clerkId: 'child_2' },
      ];

      // Mock User.find chain
      const mockSelect = vi.fn().mockResolvedValue(mockChildrenDetails);
      (User.find as any).mockReturnValue({ select: mockSelect });

      const result = await getLinkedStudents();

      expect(User.find).toHaveBeenCalledWith({
        clerkId: { $in: ['child_1', 'child_2'] },
      });
      expect(result.data).toEqual(mockChildrenDetails);
    });
  });
});
