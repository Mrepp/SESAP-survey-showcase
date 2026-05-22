import type { Demographics } from '@sesap/types';

// Small alias map for the most common abbreviation collisions we've seen
// in transcripts. Intentionally not exhaustive — the prompt instructs the
// model to return formal full names. This map is a safety net for when it
// slips an abbreviation through.
//
// Keys are lower-cased, normalized-whitespace forms; values are the
// canonical Title-Case full name.
const MAJOR_ALIASES: Record<string, string> = {
  'cs': 'Computer Science',
  'comp sci': 'Computer Science',
  'compsci': 'Computer Science',
  'cse': 'Computer Science and Engineering',
  'ce': 'Computer Engineering',
  'ee': 'Electrical Engineering',
  'ece': 'Electrical and Computer Engineering',
  'me': 'Mechanical Engineering',
  'meche': 'Mechanical Engineering',
  'mech e': 'Mechanical Engineering',
  'cheme': 'Chemical Engineering',
  'chem e': 'Chemical Engineering',
  'bme': 'Biomedical Engineering',
  'civ e': 'Civil Engineering',
  'ie': 'Industrial Engineering',
  'aero': 'Aerospace Engineering',
  'bio': 'Biology',
  'biol': 'Biology',
  'chem': 'Chemistry',
  'math': 'Mathematics',
  'stat': 'Statistics',
  'stats': 'Statistics',
  'econ': 'Economics',
  'psych': 'Psychology',
  'poli sci': 'Political Science',
  'polisci': 'Political Science',
  'it': 'Information Technology',
  'mis': 'Management Information Systems',
  'eng': 'English',
  'bus': 'Business Administration',
  'ba': 'Business Administration',
};

// Lowercase tokens that should stay lowercase in Title Case (except as
// the first word), the way style guides treat short prepositions/articles.
const LOWERCASE_PARTICLES = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of',
  'on', 'or', 'the', 'to', 'vs', 'with',
]);

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function titleCaseWord(word: string, isFirst: boolean): string {
  if (!word) return word;
  const lower = word.toLowerCase();
  if (!isFirst && LOWERCASE_PARTICLES.has(lower)) return lower;
  // Preserve hyphens and slashes piecewise (e.g., "pre-med", "math/cs").
  return lower.replace(/[a-z]+/gi, (m) => m.charAt(0).toUpperCase() + m.slice(1));
}

function titleCase(s: string): string {
  const cleaned = collapseWhitespace(s);
  if (!cleaned) return cleaned;
  return cleaned.split(' ').map((w, i) => titleCaseWord(w, i === 0)).join(' ');
}

export function normalizeMajor(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = collapseWhitespace(raw).toLowerCase().replace(/\.+$/, '');
  if (!cleaned) return undefined;
  const aliased = MAJOR_ALIASES[cleaned];
  if (aliased) return aliased;
  return titleCase(cleaned);
}

export function normalizeCollege(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = collapseWhitespace(raw);
  if (!cleaned) return undefined;
  // Common variants of the host institution collapse to the canonical name.
  const lc = cleaned.toLowerCase();
  if (lc === 'osu' || lc === 'oregon state' || lc === 'oregon state univ' || lc === 'oregon state university') {
    return 'Oregon State University';
  }
  return titleCase(cleaned);
}

function normalizeFreeText(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = collapseWhitespace(raw);
  return cleaned || undefined;
}

function normalizeYear(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/\b(19|20)\d{2}\b/);
  if (match) return match[0];
  const cleaned = collapseWhitespace(raw);
  return cleaned || undefined;
}

/**
 * Normalize an inbound Demographics-shaped record. Returns a copy with
 * trimmed, case-cleaned values and well-known aliases collapsed. Nulls and
 * empty strings become `undefined` so callers can use the simple
 * `next[k] ||= normalized[k]` merge pattern without polluting the record
 * with empty strings.
 */
export function normalizeDemographics(input: Partial<Demographics> | null | undefined): Partial<Demographics> {
  if (!input) return {};
  const out: Partial<Demographics> = {};
  if (input.college !== undefined) out.college = normalizeCollege(input.college);
  if (input.major !== undefined) out.major = normalizeMajor(input.major);
  if (input.graduationYear !== undefined) out.graduationYear = normalizeYear(input.graduationYear);
  if (input.gender !== undefined) out.gender = normalizeFreeText(input.gender);
  if (input.ethnicity !== undefined) out.ethnicity = normalizeFreeText(input.ethnicity);
  if (input.age !== undefined) out.age = normalizeFreeText(input.age);
  if (input.year !== undefined) out.year = normalizeFreeText(input.year);
  return out;
}
