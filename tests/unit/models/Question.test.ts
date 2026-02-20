import { describe, it, expect } from 'vitest';
import Question from '@/lib/db/models/Question';

describe('Question Model', () => {
  it('should validate a correct question', () => {
    const validQuestion = new Question({
      text: 'What is 2+2?',
      type: 'mcq',
      createdBy: 'user_123',
      options: ['3', '4', '5'],
      correctAnswer: '4',
      subject: 'Math',
      topic: 'Addition',
    });

    const error = validQuestion.validateSync();
    expect(error).toBeUndefined();
  });

  it('should require text', () => {
    const question = new Question({
      type: 'mcq',
      createdBy: 'user_123',
    });

    const error = question.validateSync();
    expect(error?.errors['text']).toBeDefined();
  });

  it('should require type', () => {
    const question = new Question({
      text: 'Question text',
      createdBy: 'user_123',
    });

    const error = question.validateSync();
    expect(error?.errors['type']).toBeDefined();
  });

  it('should require createdBy', () => {
    const question = new Question({
      text: 'Question text',
      type: 'mcq',
    });

    const error = question.validateSync();
    expect(error?.errors['createdBy']).toBeDefined();
  });

  it('should enforce valid question type', () => {
    const question = new Question({
      text: 'Question text',
      type: 'invalid_type',
      createdBy: 'user_123',
    });

    const error = question.validateSync();
    expect(error?.errors['type']).toBeDefined();
  });

  it('should enforce valid difficulty level', () => {
    const question = new Question({
      text: 'Question text',
      type: 'mcq',
      createdBy: 'user_123',
      difficulty: 'insane',
    });

    const error = question.validateSync();
    expect(error?.errors['difficulty']).toBeDefined();
  });

  it('should have default values', () => {
    const question = new Question({
      text: 'Question text',
      type: 'mcq',
      createdBy: 'user_123',
    });

    expect(question.marks).toBe(1);
    expect(question.difficulty).toBe('medium');
  });
});
