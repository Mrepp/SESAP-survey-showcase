import { describe, it, expect } from 'vitest';
import {
  cosineSimilarity,
  euclideanDistance,
  normalizeVector,
} from '../src/vector-math';
import {
  generateInterviewId,
  generateBuildId,
  generateItemId,
} from '../src/id-generator';
import {
  SesapError,
  NotFoundError,
  ValidationError,
  ProcessingError,
  AuthenticationError,
} from '../src/errors';
import { DemographicsSchema, InterviewMetadataSchema, ThemeSchema } from '../src/validation';
import { THEME_TITLES, isThemeTitle } from '../src/theme-enum';

describe('vector-math', () => {
  it('cosineSimilarity returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
  });

  it('cosineSimilarity returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('cosineSimilarity throws on dimension mismatch', () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow('dimension mismatch');
  });

  it('cosineSimilarity returns 0 for zero vectors', () => {
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
  });

  it('euclideanDistance returns 0 for identical vectors', () => {
    expect(euclideanDistance([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it('euclideanDistance computes correctly', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBeCloseTo(5);
  });

  it('normalizeVector produces unit vector', () => {
    const result = normalizeVector([3, 4]);
    const norm = Math.sqrt(result[0] ** 2 + result[1] ** 2);
    expect(norm).toBeCloseTo(1);
  });

  it('normalizeVector returns zero vector unchanged', () => {
    expect(normalizeVector([0, 0, 0])).toEqual([0, 0, 0]);
  });
});

describe('id-generator', () => {
  it('generateInterviewId starts with int_', () => {
    expect(generateInterviewId()).toMatch(/^int_.+/);
  });

  it('generateBuildId starts with build_', () => {
    expect(generateBuildId()).toMatch(/^build_.+/);
  });

  it('generateItemId combines parts', () => {
    expect(generateItemId('int_abc', 'theme', 0)).toBe('int_abc_theme_0');
  });
});

describe('errors', () => {
  it('SesapError has correct properties', () => {
    const err = new SesapError('test', 'TEST', 422, { detail: true });
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST');
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual({ detail: true });
  });

  it('NotFoundError sets 404', () => {
    const err = new NotFoundError('Interview', 'abc');
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('abc');
  });

  it('ValidationError sets 400', () => {
    expect(new ValidationError('bad input').statusCode).toBe(400);
  });

  it('ProcessingError sets 500', () => {
    expect(new ProcessingError('failed').statusCode).toBe(500);
  });

  it('AuthenticationError sets 401', () => {
    expect(new AuthenticationError().statusCode).toBe(401);
  });
});

describe('validation schemas', () => {
  it('DemographicsSchema accepts valid data', () => {
    const result = DemographicsSchema.safeParse({
      college: 'MIT',
      graduationYear: '2024',
      major: 'CS',
    });
    expect(result.success).toBe(true);
  });

  it('DemographicsSchema rejects missing required fields', () => {
    const result = DemographicsSchema.safeParse({ college: 'MIT' });
    expect(result.success).toBe(false);
  });

  it('InterviewMetadataSchema accepts valid data', () => {
    const result = InterviewMetadataSchema.safeParse({
      interviewDate: '2024-01-01',
      interviewer: 'Jane Doe',
    });
    expect(result.success).toBe(true);
  });

  it('ThemeSchema accepts canonical theme titles', () => {
    const result = ThemeSchema.safeParse({
      id: 'th1',
      title: THEME_TITLES[0],
      description: 'Desc',
      category: 'academic',
      frequency: 2,
      relatedQuoteIds: [],
    });
    expect(result.success).toBe(true);
  });

  it('ThemeSchema rejects invalid theme titles', () => {
    const result = ThemeSchema.safeParse({
      id: 'th1',
      title: 'Invalid Theme',
      description: 'Desc',
      category: 'academic',
      frequency: 2,
      relatedQuoteIds: [],
    });
    expect(result.success).toBe(false);
  });

  it('isThemeTitle matches canonical list', () => {
    expect(isThemeTitle('Belonging')).toBe(true);
    expect(isThemeTitle('Academic Growth')).toBe(false);
  });
});
