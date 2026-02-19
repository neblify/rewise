import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeOnboarding } from '@/app/actions/onboarding';
import { auth, clerkClient } from '@clerk/nextjs/server';
import User from '@/lib/db/models/User';

// Mock Dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
}));

vi.mock('@/lib/db/connect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Models
vi.mock('@/lib/db/models/User', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

describe('Onboarding Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('completeOnboarding', () => {
    it('should fail if user is not authenticated', async () => {
      (auth as any).mockResolvedValue({ userId: null });
      const formData = new FormData();
      const result = await completeOnboarding({}, formData);
      expect(result.message).toBe('No Logged In User');
    });

    it('should fail if role validation fails', async () => {
      (auth as any).mockResolvedValue({ userId: 'user_123' });
      const formData = new FormData();
      formData.append('role', 'invalid_role');

      const result = await completeOnboarding({}, formData);
      expect(result.message).toBe('Invalid role selection');
    });

    it('should complete onboarding successfully', async () => {
      (auth as any).mockResolvedValue({ userId: 'user_123' });

      const mockUser = {
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUpdateMetadata = vi.fn();
      (clerkClient as any).mockResolvedValue({
        users: {
          getUser: vi.fn().mockResolvedValue(mockUser),
          updateUserMetadata: mockUpdateMetadata,
        },
      });

      const formData = new FormData();
      formData.append('role', 'teacher');

      const result = await completeOnboarding({}, formData);

      // Verify DB update
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: 'user_123' },
        {
          clerkId: 'user_123',
          email: 'test@example.com',
          role: 'teacher',
          firstName: 'Test',
          lastName: 'User',
        },
        { upsert: true, new: true }
      );

      // Verify Clerk metadata update
      expect(mockUpdateMetadata).toHaveBeenCalledWith('user_123', {
        publicMetadata: { role: 'teacher' },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Success');
    });

    it('should handle errors gracefully', async () => {
      (auth as any).mockResolvedValue({ userId: 'user_123' });

      // Mock Clerk client failure
      (clerkClient as any).mockRejectedValue(new Error('Clerk Error'));

      const formData = new FormData();
      formData.append('role', 'teacher');

      const result = await completeOnboarding({}, formData);
      expect(result.message).toBe('Failed to update profile');
    });
  });
});
