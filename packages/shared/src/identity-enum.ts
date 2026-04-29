import { z } from 'zod';

// Canonical list of identity labels used across the LLM extraction pipeline
// and the showcase UI (BarChart "Theme Frequency by Identity").
export const IDENTITY_LABELS = [
  'Disabled',
  'First-Generation',
  'Immigrant',
  'International Student',
  'LGBTQ+',
  'Low-Income',
  'Non-Traditional Age',
  'Parent',
  'Religious',
  'Rural',
  'STEM Minoritized',
  'Student of Color',
  'Transfer Student',
  'Veteran',
  'Working Student',
] as const;

export const IdentityLabelSchema = z.enum(IDENTITY_LABELS);

export type IdentityLabel = z.infer<typeof IdentityLabelSchema>;

export function isIdentityLabel(value: unknown): value is IdentityLabel {
  return IdentityLabelSchema.safeParse(value).success;
}
