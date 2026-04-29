import type { TimelinePoint, Term } from '@sesap/types';

// Anchor midpoint per term. Mirrors the LLM prompt's anchor table so values
// inferred client-side line up with values the model would produce.
export const TERM_MIDPOINTS: Record<Term, number> = {
  pre_college: -0.125,
  freshman_fall: 0.03125,
  freshman_winter: 0.09375,
  freshman_spring: 0.15625,
  freshman_summer: 0.21875,
  sophomore_fall: 0.28125,
  sophomore_winter: 0.34375,
  sophomore_spring: 0.40625,
  sophomore_summer: 0.46875,
  junior_fall: 0.53125,
  junior_winter: 0.59375,
  junior_spring: 0.65625,
  junior_summer: 0.71875,
  senior_fall: 0.78125,
  senior_winter: 0.84375,
  senior_spring: 0.90625,
  senior_summer: 0.96875,
  post_college: 1.25,
  unknown: 0.5,
};

const YEAR_KEYWORDS: Array<[RegExp, 'freshman' | 'sophomore' | 'junior' | 'senior']> = [
  [/\b(freshman|first[\s-]?year|1st\s+year|frosh)\b/i, 'freshman'],
  [/\b(sophomore|second[\s-]?year|2nd\s+year)\b/i, 'sophomore'],
  [/\b(junior|third[\s-]?year|3rd\s+year)\b/i, 'junior'],
  [/\b(senior|fourth[\s-]?year|4th\s+year|final\s+year)\b/i, 'senior'],
];

// Order matters: winter must match before spring so "winter quarter" doesn't
// fall through to the spring branch.
const SEASON_KEYWORDS: Array<[RegExp, 'fall' | 'winter' | 'spring' | 'summer']> = [
  [/\b(fall|autumn|first\s+quarter|1st\s+quarter|first\s+semester|1st\s+semester)\b/i, 'fall'],
  [/\b(winter|second\s+quarter|2nd\s+quarter)\b/i, 'winter'],
  [/\b(spring|third\s+quarter|3rd\s+quarter|second\s+semester|2nd\s+semester)\b/i, 'spring'],
  [/\bsummer\b/i, 'summer'],
];

// Infer a term from the free-text fields (period / event / significance).
// Returns 'unknown' when no keyword match is found.
export function inferTerm(point: Pick<TimelinePoint, 'period' | 'event' | 'significance'>): Term {
  const haystack = [point.period, point.event, point.significance]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!haystack) return 'unknown';

  // Post-college signals first (they often contain "after senior year" etc.). All
  // post-college events collapse into a single bucket; relative position carries
  // any further detail.
  if (/\b(grad\s+school|graduate\s+school|master'?s|m\.?s\.?\s+program|ph\.?d\.?|doctoral|first\s+job|new\s+job|full[\s-]time\s+role|early\s+career|started\s+work|professional\s+life|industry|post[\s-]?grad|after\s+(college|graduation)|graduated|graduation\s+(day|ceremony)|commencement)\b/.test(haystack)) {
    return 'post_college';
  }
  if (/\b(high\s+school|before\s+college|pre[\s-]?college|gap\s+year)\b/.test(haystack)) {
    return 'pre_college';
  }

  let year: 'freshman' | 'sophomore' | 'junior' | 'senior' | null = null;
  for (const [re, label] of YEAR_KEYWORDS) {
    if (re.test(haystack)) { year = label; break; }
  }
  if (!year) return 'unknown';

  let season: 'fall' | 'winter' | 'spring' | 'summer' | null = null;
  for (const [re, label] of SEASON_KEYWORDS) {
    if (re.test(haystack)) { season = label; break; }
  }
  if (!season) season = 'fall'; // default to the year's start

  return `${year}_${season}` as Term;
}

// Fill missing `term` / `position` on a timeline by inferring from existing
// free-text fields. Returns a new array; only points missing the value are
// touched. Returned `mutated` indicates whether anything changed.
export function backfillTimeline(timeline: TimelinePoint[]): {
  timeline: TimelinePoint[];
  mutated: boolean;
} {
  let mutated = false;
  const next = timeline.map((p) => {
    const updates: Partial<TimelinePoint> = {};
    if (!p.term) {
      const inferred = inferTerm(p);
      updates.term = inferred;
    }
    const term = (updates.term ?? p.term ?? 'unknown') as Term;
    if (typeof p.position !== 'number') {
      updates.position = TERM_MIDPOINTS[term];
    }
    if (Object.keys(updates).length > 0) {
      mutated = true;
      return { ...p, ...updates };
    }
    return p;
  });
  return { timeline: next, mutated };
}
