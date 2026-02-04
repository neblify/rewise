import { describe, it, expect } from 'vitest';
import Result from '@/lib/db/models/Result';
import mongoose from 'mongoose';

describe('Result Model', () => {
    it('should validate a correct result', () => {
        const validResult = new Result({
            testId: new mongoose.Types.ObjectId(),
            studentId: 'student_123',
            answers: [
                {
                    questionId: 'q1',
                    answer: 'A',
                    isCorrect: true,
                    marksObtained: 1
                }
            ],
            totalScore: 10,
            maxScore: 10
        });

        const error = validResult.validateSync();
        expect(error).toBeUndefined();
    });

    it('should require testId', () => {
        const result = new Result({
            studentId: 'student_123'
        });

        const error = result.validateSync();
        expect(error?.errors['testId']).toBeDefined();
    });

    it('should require studentId', () => {
        const result = new Result({
            testId: new mongoose.Types.ObjectId()
        });

        const error = result.validateSync();
        expect(error?.errors['studentId']).toBeDefined();
    });

    it('should have default scores of 0', () => {
        const result = new Result({
            testId: new mongoose.Types.ObjectId(),
            studentId: 'student_123'
        });

        expect(result.totalScore).toBe(0);
        expect(result.maxScore).toBe(0);
    });

    it('should allow optional fields to be empty', () => {
        const result = new Result({
            testId: new mongoose.Types.ObjectId(),
            studentId: 'student_123'
        });

        const error = result.validateSync();
        expect(error).toBeUndefined();
        expect(result.answers).toHaveLength(0);
        expect(result.weakAreas).toHaveLength(0);
    });
});
