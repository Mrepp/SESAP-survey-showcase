import { describe, it, expect } from 'vitest';
import {
  normalizeMajor,
  normalizeCollege,
  normalizeDemographics,
} from '../src/demographics-normalizer';

describe('normalizeMajor', () => {
  it('expands common abbreviations to the canonical name', () => {
    expect(normalizeMajor('CS')).toBe('Computer Science');
    expect(normalizeMajor('cs')).toBe('Computer Science');
    expect(normalizeMajor('Cs')).toBe('Computer Science');
    expect(normalizeMajor('comp sci')).toBe('Computer Science');
    expect(normalizeMajor('EE')).toBe('Electrical Engineering');
    expect(normalizeMajor('me')).toBe('Mechanical Engineering');
    expect(normalizeMajor('cheme')).toBe('Chemical Engineering');
    expect(normalizeMajor('Poli Sci')).toBe('Political Science');
    expect(normalizeMajor('Bio')).toBe('Biology');
  });

  it('title-cases free text that is not a known abbreviation', () => {
    expect(normalizeMajor('computer science')).toBe('Computer Science');
    expect(normalizeMajor('COMPUTER SCIENCE')).toBe('Computer Science');
    expect(normalizeMajor('  electrical engineering  ')).toBe('Electrical Engineering');
  });

  it('keeps short particles lowercase except as first word', () => {
    expect(normalizeMajor('history of science')).toBe('History of Science');
    expect(normalizeMajor('the arts')).toBe('The Arts');
  });

  it('returns undefined for empty/null inputs', () => {
    expect(normalizeMajor('')).toBeUndefined();
    expect(normalizeMajor(null)).toBeUndefined();
    expect(normalizeMajor(undefined)).toBeUndefined();
    expect(normalizeMajor('   ')).toBeUndefined();
  });
});

describe('normalizeCollege', () => {
  it('collapses OSU variants', () => {
    expect(normalizeCollege('OSU')).toBe('Oregon State University');
    expect(normalizeCollege('osu')).toBe('Oregon State University');
    expect(normalizeCollege('Oregon State')).toBe('Oregon State University');
    expect(normalizeCollege('Oregon State University')).toBe('Oregon State University');
  });

  it('title-cases other inputs', () => {
    expect(normalizeCollege('university of oregon')).toBe('University of Oregon');
  });
});

describe('normalizeDemographics', () => {
  it('normalizes a sparse object', () => {
    const out = normalizeDemographics({ major: 'cs', college: 'osu' });
    expect(out.major).toBe('Computer Science');
    expect(out.college).toBe('Oregon State University');
  });

  it('drops empty strings to undefined', () => {
    const out = normalizeDemographics({ major: '', gender: '   ' });
    expect(out.major).toBeUndefined();
    expect(out.gender).toBeUndefined();
  });

  it('extracts a year from messy input', () => {
    const out = normalizeDemographics({ graduationYear: 'class of 2024 (spring)' });
    expect(out.graduationYear).toBe('2024');
  });
});
