/**
 * Canonical categories used across summaries, themes and areas for improvement.
 * One list, so the three editors — and any future consumer — cannot drift.
 */
export const CATEGORIES = [
  'academic',
  'social',
  'personal',
  'career',
  'financial',
  'campus_life',
  'mental_health',
  'diversity',
  'extracurricular',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
