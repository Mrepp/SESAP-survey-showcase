import { z } from 'zod';

export const THEME_TITLES = [
  'Academic Difficulty',
  'Belonging',
  'Career Preparation',
  'Cultural Representation',
  'Faculty Support',
  'Family Pressure',
  'Financial Struggles',
  'Identity & Discrimination',
  'Mental Health',
  'Language Barriers',
  'Peer Relationships',
  'Personal Growth',
  'Support Networks',
  'Work-Life Balance',
] as const;

export const ThemeTitleSchema = z.enum(THEME_TITLES);

export type ThemeTitle = z.infer<typeof ThemeTitleSchema>;

export function isThemeTitle(value: unknown): value is ThemeTitle {
  return ThemeTitleSchema.safeParse(value).success;
}
