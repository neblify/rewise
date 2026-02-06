import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfile } from '@/app/student/profile/actions';
import { auth } from '@clerk/nextjs/server';
import User from '@/lib/db/models/User';
import { revalidatePath } from 'next/cache';

// Mock Dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/connect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Models
vi.mock('@/lib/db/models/User', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

describe('Student Profile Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('should fail if user is not authenticated', async () => {
      (auth as any).mockResolvedValue({ userId: null });
      const formData = new FormData();
      const result = await updateProfile(formData);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    it('should fail if required fields are missing', async () => {
      (auth as any).mockResolvedValue({ userId: 'user_123' });
      const formData = new FormData();
      // Missing board and grade
      const result = await updateProfile(formData);
      expect(result.success).toBe(false);
      expect(result.message).toBe('All fields are required');
    });

    it('should update profile successfully', async () => {
      (auth as any).mockResolvedValue({ userId: 'user_123' });

      const formData = new FormData();
      formData.append('board', 'CBSE');
      formData.append('grade', '10');

      (User.findOneAndUpdate as any).mockResolvedValue({
        clerkId: 'user_123',
        board: 'CBSE',
      });

      const result = await updateProfile(formData);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: 'user_123' },
        { board: 'CBSE', grade: '10' },
        { upsert: true, new: true }
      );
      expect(revalidatePath).toHaveBeenCalledWith('/student');
      expect(revalidatePath).toHaveBeenCalledWith('/student/profile');
      expect(result.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (auth as any).mockResolvedValue({ userId: 'user_123' });
      const formData = new FormData();
      formData.append('board', 'CBSE');
      formData.append('grade', '10');

      (User.findOneAndUpdate as any).mockRejectedValue(
        new Error('DB connection failed')
      );

      const result = await updateProfile(formData);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update profile');
    });
  });
});
