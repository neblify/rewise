import { describe, it, expect } from 'vitest';
import Test from '@/lib/db/models/Test';
import mongoose from 'mongoose';

describe('Test Model', () => {
    it('should validate a correct test', () => {
        const validTest = new Test({
            title: 'Sample Test',
            subject: 'Physics',
            createdBy: 'teacher_123',
            visibility: 'public',
            isPublished: false,
            sections: [
                {
                    title: 'Section A',
                    questions: []
                }
            ]
        });

        const error = validTest.validateSync();
        expect(error).toBeUndefined();
    });

    it('should require title, subject, and createdBy', () => {
        const test = new Test({
            visibility: 'public'
        });

        const error = test.validateSync();
        expect(error?.errors['title']).toBeDefined();
        expect(error?.errors['subject']).toBeDefined();
        expect(error?.errors['createdBy']).toBeDefined();
    });

    it('should enforce visibility enum', () => {
        const test = new Test({
            title: 'Sample Test',
            subject: 'Physics',
            createdBy: 'teacher_123',
            visibility: 'hidden' // Invalid
        });

        const error = test.validateSync();
        expect(error?.errors['visibility']).toBeDefined();
    });

    it('should default visibility to public and isPublished to false', () => {
        const test = new Test({
            title: 'Sample Test',
            subject: 'Physics',
            createdBy: 'teacher_123'
        });

        expect(test.visibility).toBe('public');
        expect(test.isPublished).toBe(false);
    });

    it('should validate array of sections', () => {
        const test = new Test({
            title: 'Sample Test',
            subject: 'Physics',
            createdBy: 'teacher_123',
            sections: [
                {
                    description: 'Missing title'
                }
            ]
        });

        const error = test.validateSync();
        // Mongoose subdocument validation error structure can be complex
        // We expect an error related to sections.0.title
        expect(error?.errors['sections.0.title']).toBeDefined();
    });
});
