import { describe, it, expect } from 'vitest';
import {
  getGradesForBoard,
  NIOS_LEVELS,
  STANDARD_LEVELS,
} from '@/lib/constants/levels';
import { BOARDS } from '@/lib/constants/boards';

describe('Constants', () => {
  describe('boards.ts', () => {
    it('should contain required boards', () => {
      expect(BOARDS).toContain('NIOS');
      expect(BOARDS).toContain('CBSE');
      expect(BOARDS.length).toBeGreaterThan(0);
    });
  });

  describe('levels.ts', () => {
    it('should return NIOS levels for NIOS board', () => {
      const levels = getGradesForBoard('NIOS');
      expect(levels).toHaveLength(NIOS_LEVELS.length);
      expect(levels[0]).toEqual({ value: 'A', label: 'Level A' });
    });

    it('should return Standard levels for other boards', () => {
      const levels = getGradesForBoard('CBSE');
      expect(levels).toHaveLength(STANDARD_LEVELS.length);
      expect(levels[0]).toEqual({ value: '1', label: 'Class 1' });
      expect(levels[11]).toEqual({ value: '12', label: 'Class 12' });
    });

    it('should generate standard levels correctly', () => {
      expect(STANDARD_LEVELS).toHaveLength(12);
      expect(STANDARD_LEVELS).toContain('1');
      expect(STANDARD_LEVELS).toContain('12');
    });
  });
});
