import { THEME_TITLES } from './theme-enum';
import { IDENTITY_LABELS } from './identity-enum';

export const ANALYSIS_PROMPT_VERSION = '2026-04-29.3';
export const ANALYSIS_SCHEMA_VERSION = '2.1.0';

const TRANSCRIPT_PLACEHOLDER = '__TRANSCRIPT_PLACEHOLDER__';

const themePipeList = THEME_TITLES.join(' | ');
const themeCommaList = THEME_TITLES.join(', ');
const identityPipeList = IDENTITY_LABELS.join(' | ');
const identityCommaList = IDENTITY_LABELS.join(', ');

export function buildAnalysisPrompt(transcript: string): string {
  return `You are an expert qualitative researcher analyzing a student interview transcript from the SESAP (Student Experience Survey & Analysis Project). Analyze the following transcript and produce a structured JSON response.

Your response MUST be valid JSON matching this exact structure:

{
  "summaries": [
    {
      "summaryText": "A concise summary of a key aspect of the interview",
      "category": "academic | social | personal | career | financial | campus_life | mental_health | diversity | extracurricular | other",
      "confidence": 0.0 to 1.0
    }
  ],
  "timeline": [
    {
      "event": "Description of a significant event or experience",
      "period": "e.g. freshman year, summer 2022, senior year",
      "term": "pre_college | freshman_fall | freshman_winter | freshman_spring | freshman_summer | sophomore_fall | sophomore_winter | sophomore_spring | sophomore_summer | junior_fall | junior_winter | junior_spring | junior_summer | senior_fall | senior_winter | senior_spring | senior_summer | post_college | unknown",
      "position": number on the normalized scale (typically -0.25 to 1.5; may extend further for events well before or long after college),
      "significance": "Why this event matters in the student's journey"
    }
  ],
  "themes": [
    {
      "title": "Must be one of: ${themePipeList}",
      "description": "Detailed description of the theme",
      "category": "academic | social | personal | career | financial | campus_life | mental_health | diversity | extracurricular | other",
      "frequency": 1 to 10 (how often this theme appears),
      "relatedQuoteIds": []
    }
  ],
  "quotes": [
    {
      "quoteText": "Exact quote from the transcript",
      "context": "What was being discussed when this quote occurred",
      "sentiment": "positive | negative | neutral | mixed",
      "significanceLevel": "high | medium | low",
      "tags": ["relevant", "tags"],
      "themeIds": [],
      "timelineEventIndex": 0
    }
  ],
  "areasForImprovement": [
    {
      "area": "Short title for the area",
      "description": "What could be improved and why",
      "category": "academic | social | personal | career | financial | campus_life | mental_health | diversity | extracurricular | other",
      "priority": "high | medium | low"
    }
  ],
  "identities": [
    {
      "label": "Must be one of: ${identityPipeList}",
      "confidence": 0.0 to 1.0,
      "evidence": "Short verbatim quote or paraphrase from the transcript justifying this identity"
    }
  ]
}

Guidelines:
- Extract 3-6 summaries covering the main topics discussed
- Identify 3-8 timeline points in chronological order
- Identify 3-7 recurring themes with meaningful descriptions
- Theme titles MUST be selected exactly from this list: ${themeCommaList}
- Do NOT invent new theme titles or modify the provided ones
- Select only themes that are actually present in the interview
- Extract 5-15 significant direct quotes that illustrate key points
- Identify 2-5 areas for improvement mentioned or implied
- Do NOT include "id" fields - those will be assigned later
- The relatedQuoteIds and themeIds arrays should be empty - they will be linked later
- For each quote, set "significanceLevel" to "high" when the quote captures a turning point or core insight, "medium" for substantive supporting evidence, "low" for minor color
- For each quote, set "timelineEventIndex" to the zero-based index of the timeline event the quote most directly anchors to (referring to the order of events in YOUR timeline array). Use null when the quote is general and does not belong to a specific event. Most narrative quotes should anchor; aphoristic or summary quotes often should not.
- Ensure all quotes are verbatim from the transcript
- Confidence scores should reflect how clearly the topic was discussed
- Be thorough but concise in descriptions

Timeline position scale (REQUIRED for every timeline point):
- The undergraduate experience is modeled as 4 academic years × 4 quarters (fall, winter, spring, summer) = 16 in-college terms. Each quarter occupies 0.0625 of the scale; each year occupies 0.25.
- "position" is a normalized number where 0.0 = the start of freshman fall and 1.0 = the end of senior summer. Pre-college sits in -0.25..0.0; post-college sits in 1.0..1.5. Events that occurred well before or long after college may use positions outside that named range — the scale is permissive.
- Anchor midpoints (use these when only the term is known):
  - pre_college: -0.125
  - freshman_fall: 0.03125    freshman_winter: 0.09375    freshman_spring: 0.15625    freshman_summer: 0.21875
  - sophomore_fall: 0.28125   sophomore_winter: 0.34375   sophomore_spring: 0.40625   sophomore_summer: 0.46875
  - junior_fall: 0.53125      junior_winter: 0.59375      junior_spring: 0.65625      junior_summer: 0.71875
  - senior_fall: 0.78125      senior_winter: 0.84375      senior_spring: 0.90625      senior_summer: 0.96875
  - post_college: ~1.25 (use higher values for events further from graduation; lower values for events just after graduating)
- "term" must be one of the 19 enum values. Everything before freshman fall is "pre_college"; everything after senior summer is "post_college"; in-college events pick the matching quarter. Use "unknown" only if even the year cannot be inferred.

Identity extraction (REQUIRED — return [] if none can be supported):
- Allowed identity labels (use exact strings): ${identityCommaList}
- Only assert an identity when the transcript provides direct support: explicit self-identification, unambiguous statement of circumstance (e.g. "I'm the first in my family to go to college", "I work two jobs to pay tuition", "as a veteran, …"), or clearly stated demographic fact.
- Do NOT infer identity from name, accent, appearance, religion of family members not shared by the student, country mentioned in passing, etc.
- "evidence" must be a brief verbatim quote or close paraphrase from the transcript that justifies the assignment.
- "confidence" should reflect how unambiguous the textual evidence is (1.0 = explicit self-identification; 0.5 = strongly implied but not stated outright).
- It is acceptable and expected for many interviews to have an empty identities array.

TRANSCRIPT:
${transcript}

Respond ONLY with the JSON object. Do not include any text before or after the JSON.`;
}

export function fnv1aHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export const ANALYSIS_PROMPT_HASH = fnv1aHash(buildAnalysisPrompt(TRANSCRIPT_PLACEHOLDER));

export interface AnalysisStamp {
  promptVersion: string;
  promptHash: string;
  schemaVersion: string;
}

export const currentPromptStamp: AnalysisStamp = {
  promptVersion: ANALYSIS_PROMPT_VERSION,
  promptHash: ANALYSIS_PROMPT_HASH,
  schemaVersion: ANALYSIS_SCHEMA_VERSION,
};

export function isAnalysisStale(
  stamp: Partial<AnalysisStamp> | undefined | null,
  current: AnalysisStamp = currentPromptStamp,
): { stale: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!stamp) {
    return { stale: true, reasons: ['missing_stamp'] };
  }
  if (!stamp.promptHash) {
    reasons.push('missing_prompt_hash');
  } else if (stamp.promptHash !== current.promptHash) {
    reasons.push('prompt_drift');
  }
  if (!stamp.promptVersion) {
    reasons.push('missing_prompt_version');
  } else if (stamp.promptVersion !== current.promptVersion) {
    reasons.push('prompt_version_drift');
  }
  if (!stamp.schemaVersion) {
    reasons.push('missing_schema_version');
  } else if (stamp.schemaVersion !== current.schemaVersion) {
    reasons.push('schema_drift');
  }
  return { stale: reasons.length > 0, reasons };
}
