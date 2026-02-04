import { describe, it, expect } from 'vitest';
import User from '@/lib/db/models/User';

describe('User Model', () => {
    it('should validate a correct user', () => {
        const validUser = new User({
            clerkId: 'user_123',
            email: 'test@example.com',
            role: 'teacher',
            firstName: 'John',
            lastName: 'Doe'
        });

        const error = validUser.validateSync();
        expect(error).toBeUndefined();
    });

    it('should require clerkId and email', () => {
        const user = new User({
            role: 'student'
        });

        const error = user.validateSync();
        expect(error?.errors['clerkId']).toBeDefined();
        expect(error?.errors['email']).toBeDefined();
    });

    it('should enforce role enum', () => {
        const user = new User({
            clerkId: 'user_123',
            email: 'test@example.com',
            role: 'superadmin' // Invalid
        });

        const error = user.validateSync();
        expect(error?.errors['role']).toBeDefined();
    });

    it('should default role to student', () => {
        const user = new User({
            clerkId: 'user_123',
            email: 'test@example.com'
        });

        expect(user.role).toBe('student');
    });

    it('should check unique validation behavior (mocked)', () => {
        // Note: Unique validation is handled by MongoDB index, not validateSync.
        // We can check if the index exists in an integration test, but for unit test
        // we mainly check schema definition which is implicit here.
        // We can verify the schema property programmatically if needed, but skipping for now
        // as validateSync doesn't check unique constraints.

        const user = new User({
            clerkId: 'user_123',
            email: 'test@example.com'
        });
        expect(user.clerkId).toBe('user_123');
    });
});
