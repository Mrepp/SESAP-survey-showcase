import { z } from 'zod';
import { ThemeTitleSchema } from './theme-enum';
import { IdentityLabelSchema } from './identity-enum';

/**
 * Length and cardinality bounds.
 *
 * Every `z.string()` in this file was unbounded, and so was every array. These
 * schemas validate the submitter's only write path — `PUT
 * /api/intake/review/:token/draft` writes the parsed analysis straight to R2 —
 * and the same content is later embedded and indexed, so an oversized payload
 * costs storage, build time and AI budget as well as memory here.
 *
 * The numbers are proportionate to what the fields are for, not defensive
 * round numbers: a theme category is a word, a quote is a paragraph. Widen one
 * deliberately if real content needs it; do not remove them.
 */
const LIMITS = {
  /** Generated ids: `int_...`, `sum_...`, and the editor's `temp_` ids. */
  id: 128,
  /** A label, a category, a name — a phrase, not a sentence. */
  label: 200,
  /** A title or heading. */
  title: 300,
  /** A sentence or two: an event, an action item. */
  sentence: 1_000,
  /** A paragraph: a description, a quote, a piece of evidence. */
  paragraph: 5_000,
  /** A timestamp, a date, a duration — a formatted scalar. */
  scalar: 64,
  url: 2_048,
  /** Free-form operator notes on an interview. */
  notes: 5_000,
  /** A whole transcript, which is machine-generated from the audio. */
  transcript: 1_000_000,
  /** Concatenated text of one search document. */
  document: 200_000,
} as const;

const ARRAY_LIMITS = {
  summaries: 100,
  timeline: 200,
  themes: 100,
  quotes: 300,
  areasForImprovement: 100,
  identities: 50,
  /** Cross-references between analysis items. */
  references: 300,
  /** Short lists attached to one item: tags, stakeholders, action items. */
  shortList: 50,
  /** One embedding vector's components, and the vectors in one interview. */
  embeddingDimensions: 4_096,
  vectors: 2_000,
  /** Distinct categories and tags across a whole build. */
  facets: 1_000,
} as const;

/**
 * Demographics carry attacker-chosen keys via `.catchall`, so both the keys and
 * how many of them there are have to be bounded, not just the values.
 */
const MAX_DEMOGRAPHIC_KEYS = 24;
const MAX_DEMOGRAPHIC_KEY_LENGTH = 64;

const id = () => z.string().max(LIMITS.id);
const label = () => z.string().max(LIMITS.label);
const paragraph = () => z.string().max(LIMITS.paragraph);

// ---- Interview schemas ----

export const DemographicsSchema = z
  .object({
    college: label().optional(),
    graduationYear: label().optional(),
    major: label().optional(),
    gender: label().optional(),
    ethnicity: label().optional(),
    age: label().optional(),
    year: label().optional(),
  })
  // The catchall stays — records in the wild carry extra keys, and dropping it
  // would fail their parse — but it is no longer a hole an unauthenticated
  // caller can pour arbitrary keys of arbitrary length through. Reachable from
  // `POST /api/intake/session/profile`.
  .catchall(label().optional())
  .superRefine((value, ctx) => {
    const keys = Object.keys(value);
    if (keys.length > MAX_DEMOGRAPHIC_KEYS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Too many demographic fields: at most ${MAX_DEMOGRAPHIC_KEYS} are allowed.`,
      });
    }
    for (const key of keys) {
      if (key.length > MAX_DEMOGRAPHIC_KEY_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Demographic field names must be ${MAX_DEMOGRAPHIC_KEY_LENGTH} characters or fewer.`,
          path: [key],
        });
      }
    }
  });

export const TranscriptValidationSchema = z.object({
  wordCount: z.number(),
  hasQuestions: z.boolean(),
  hasResponses: z.boolean(),
  estimatedDuration: z.string().max(LIMITS.scalar),
});

export const TranscriptSchema = z.object({
  rawText: z.string().max(LIMITS.transcript),
  validation: TranscriptValidationSchema,
});

export const InterviewMetadataSchema = z.object({
  interviewDate: z.string().max(LIMITS.scalar),
  interviewer: label().optional(),
  interviewURL: z.string().max(LIMITS.url).optional(),
  notes: z.string().max(LIMITS.notes).optional(),
});

export const InterviewVideoSchema = z.object({
  provider: z.enum(['kaltura', 'youtube', 'vimeo', 'iframe']),
  embedUrl: z.string().url().max(LIMITS.url),
  sourceUrl: z.string().max(LIMITS.url).optional(),
  entryId: label().optional(),
  partnerId: label().optional(),
  widgetId: label().optional(),
  uiconfId: label().optional(),
});

export const InterviewSchema = z.object({
  id: id(),
  title: z.string().max(LIMITS.title),
  demographics: DemographicsSchema,
  transcript: TranscriptSchema,
  metadata: InterviewMetadataSchema,
  video: InterviewVideoSchema.optional(),
  analysis: z.lazy(() => AnalysisSchema).optional(),
  embeddings: z.lazy(() => InterviewEmbeddingsSchema).optional(),
  createdAt: z.string().max(LIMITS.scalar),
  updatedAt: z.string().max(LIMITS.scalar),
});

// ---- Analysis schemas ----

export const LLMModelConfigSchema = z.object({
  model: label(),
  temperature: z.number(),
  maxTokens: z.number(),
});

export const SummarySchema = z.object({
  id: id(),
  summaryText: paragraph(),
  category: label(),
  confidence: z.number(),
});

import type { Term } from '@sesap/types';

const TERM_VALUES = [
  'pre_college',
  'freshman_fall',
  'freshman_winter',
  'freshman_spring',
  'freshman_summer',
  'sophomore_fall',
  'sophomore_winter',
  'sophomore_spring',
  'sophomore_summer',
  'junior_fall',
  'junior_winter',
  'junior_spring',
  'junior_summer',
  'senior_fall',
  'senior_winter',
  'senior_spring',
  'senior_summer',
  'post_college',
  'unknown',
] as const satisfies readonly Term[];

export const TermSchema = z.enum(TERM_VALUES);

export const TimelinePointSchema = z.object({
  id: id(),
  event: z.string().max(LIMITS.sentence),
  period: label(),
  significance: paragraph(),
  position: z.number().min(-1).max(3).optional(),
  term: TermSchema.optional(),
});

export const IdentitySchema = z.object({
  // A closed enum, deliberately. Keep it that way — it is one of the things
  // containing what an injected transcript can put into the analysis.
  label: IdentityLabelSchema,
  confidence: z.number().min(0).max(1),
  evidence: paragraph(),
});

export const ThemeSchema = z.object({
  id: id(),
  // Closed enum, like IdentitySchema.label above.
  title: ThemeTitleSchema,
  description: paragraph(),
  category: label(),
  frequency: z.number(),
  impactScore: z.number().optional(),
  actionable: z.boolean().optional(),
  relatedQuoteIds: z.array(id()).max(ARRAY_LIMITS.references),
});

export const QuoteSchema = z.object({
  id: id(),
  quoteText: paragraph(),
  context: paragraph(),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  tags: z.array(label()).max(ARRAY_LIMITS.shortList),
  themeIds: z.array(id()).max(ARRAY_LIMITS.references),
  timestamp: z.string().max(LIMITS.scalar).optional(),
  significanceLevel: z.enum(['high', 'medium', 'low']).optional(),
  timelineEventId: id().optional(),
});

export const AreaForImprovementSchema = z.object({
  id: id(),
  area: z.string().max(LIMITS.title),
  description: paragraph(),
  category: label(),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string().max(LIMITS.title).optional(),
  stakeholders: z.array(label()).max(ARRAY_LIMITS.shortList).optional(),
  actionItems: z.array(z.string().max(LIMITS.sentence)).max(ARRAY_LIMITS.shortList).optional(),
});

// Demographics inferred by the LLM may arrive with explicit nulls; allow them
// and treat them as "unknown". Empty strings are similarly tolerated.
const NullableString = z.union([label(), z.null()]).optional();
export const LLMDemographicsSchema = z
  .object({
    college: NullableString,
    graduationYear: NullableString,
    major: NullableString,
    gender: NullableString,
    ethnicity: NullableString,
    age: NullableString,
    year: NullableString,
  })
  .partial();

export const AnalysisSchema = z.object({
  interviewId: id(),
  modelConfig: LLMModelConfigSchema,
  summaries: z.array(SummarySchema).max(ARRAY_LIMITS.summaries),
  timeline: z.array(TimelinePointSchema).max(ARRAY_LIMITS.timeline),
  themes: z.array(ThemeSchema).max(ARRAY_LIMITS.themes),
  quotes: z.array(QuoteSchema).max(ARRAY_LIMITS.quotes),
  areasForImprovement: z.array(AreaForImprovementSchema).max(ARRAY_LIMITS.areasForImprovement),
  identities: z.array(IdentitySchema).max(ARRAY_LIMITS.identities).default([]),
  demographics: LLMDemographicsSchema.optional(),
  generatedAt: z.string().max(LIMITS.scalar),
  promptVersion: label().optional(),
  promptHash: label().optional(),
  schemaVersion: label().optional(),
});

// ---- Embeddings schemas ----

export const EmbeddingTypeSchema = z.enum([
  'summary',
  'theme',
  'quote',
  'timeline',
  'areaForImprovement',
]);

export const EmbeddingVectorSchema = z.object({
  id: id(),
  type: EmbeddingTypeSchema,
  text: z.string().max(LIMITS.paragraph),
  embedding: z.array(z.number()).max(ARRAY_LIMITS.embeddingDimensions),
  dimension: z.number(),
});

export const InterviewEmbeddingsSchema = z.object({
  interviewId: id(),
  model: label(),
  dimension: z.number(),
  vectors: z.array(EmbeddingVectorSchema).max(ARRAY_LIMITS.vectors),
  generatedAt: z.string().max(LIMITS.scalar),
});

// ---- Indexing schemas ----

export const VectorIndexEntrySchema = z.object({
  id: id(),
  index: z.number(),
  embedding: z.array(z.number()).max(ARRAY_LIMITS.embeddingDimensions),
});

export const SearchDocumentSchema = z.object({
  id: id(),
  type: z.enum(['interview', 'theme', 'quote']),
  interviewId: id(),
  title: z.string().max(LIMITS.title),
  content: z.string().max(LIMITS.document),
  demographics: z.string().max(LIMITS.notes).optional(),
  category: label().optional(),
  sentiment: label().optional(),
  tags: z.array(label()).max(ARRAY_LIMITS.shortList).optional(),
});

export const BuildMetadataSchema = z.object({
  buildId: id(),
  timestamp: z.string().max(LIMITS.scalar),
  interviewCount: z.number(),
  embeddingDimension: z.number(),
  categories: z.array(label()).max(ARRAY_LIMITS.facets),
  tags: z.array(label()).max(ARRAY_LIMITS.facets),
  artifactPaths: z.record(z.string().max(LIMITS.url)),
});

// ---- Admin schemas ----

export const ProcessingStatusSchema = z.enum([
  'pending',
  'queued',
  'transcribing',
  'processing',
  'completed',
  'failed',
]);
export const ApprovalStatusSchema = z.enum(['pending_media_review', 'pending_submitter_review', 'pending_review', 'approved', 'rejected']);

export const InterviewSourceSchema = z.enum(['transcript', 'audio', 'kaltura']);

export const CreateInterviewRequestSchema = z.object({
  title: z.string().max(LIMITS.title),
  demographics: DemographicsSchema,
  metadata: InterviewMetadataSchema,
});

// ---- API schemas ----

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: label(),
        message: z.string().max(LIMITS.sentence),
        details: z.unknown().optional(),
      })
      .optional(),
  });
