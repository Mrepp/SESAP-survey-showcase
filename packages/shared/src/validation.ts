import { z } from 'zod';
import { ThemeTitleSchema } from './theme-enum';

// ---- Interview schemas ----

export const DemographicsSchema = z
  .object({
    college: z.string(),
    graduationYear: z.string(),
    major: z.string(),
    gender: z.string().optional(),
    ethnicity: z.string().optional(),
    age: z.string().optional(),
    year: z.string().optional(),
  })
  .catchall(z.string().optional());

export const TranscriptValidationSchema = z.object({
  wordCount: z.number(),
  hasQuestions: z.boolean(),
  hasResponses: z.boolean(),
  estimatedDuration: z.string(),
});

export const TranscriptSchema = z.object({
  rawText: z.string(),
  validation: TranscriptValidationSchema,
});

export const InterviewMetadataSchema = z.object({
  interviewDate: z.string(),
  interviewer: z.string(),
  interviewURL: z.string().optional(),
  notes: z.string().optional(),
});

export const InterviewSchema = z.object({
  id: z.string(),
  title: z.string(),
  demographics: DemographicsSchema,
  transcript: TranscriptSchema,
  metadata: InterviewMetadataSchema,
  analysis: z.lazy(() => AnalysisSchema).optional(),
  embeddings: z.lazy(() => InterviewEmbeddingsSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ---- Analysis schemas ----

export const LLMModelConfigSchema = z.object({
  model: z.string(),
  temperature: z.number(),
  maxTokens: z.number(),
});

export const SummarySchema = z.object({
  id: z.string(),
  summaryText: z.string(),
  category: z.string(),
  confidence: z.number(),
});

export const TimelinePointSchema = z.object({
  id: z.string(),
  event: z.string(),
  period: z.string(),
  significance: z.string(),
});

export const ThemeSchema = z.object({
  id: z.string(),
  title: ThemeTitleSchema,
  description: z.string(),
  category: z.string(),
  frequency: z.number(),
  impactScore: z.number().optional(),
  actionable: z.boolean().optional(),
  relatedQuoteIds: z.array(z.string()),
});

export const QuoteSchema = z.object({
  id: z.string(),
  quoteText: z.string(),
  context: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  tags: z.array(z.string()),
  themeIds: z.array(z.string()),
  timestamp: z.string().optional(),
  significanceLevel: z.enum(['high', 'medium', 'low']).optional(),
});

export const AreaForImprovementSchema = z.object({
  id: z.string(),
  area: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string().optional(),
  stakeholders: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
});

export const AnalysisSchema = z.object({
  interviewId: z.string(),
  modelConfig: LLMModelConfigSchema,
  summaries: z.array(SummarySchema),
  timeline: z.array(TimelinePointSchema),
  themes: z.array(ThemeSchema),
  quotes: z.array(QuoteSchema),
  areasForImprovement: z.array(AreaForImprovementSchema),
  generatedAt: z.string(),
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
  id: z.string(),
  type: EmbeddingTypeSchema,
  text: z.string(),
  embedding: z.array(z.number()),
  dimension: z.number(),
});

export const InterviewEmbeddingsSchema = z.object({
  interviewId: z.string(),
  model: z.string(),
  dimension: z.number(),
  vectors: z.array(EmbeddingVectorSchema),
  generatedAt: z.string(),
});

// ---- Indexing schemas ----

export const VectorIndexEntrySchema = z.object({
  id: z.string(),
  index: z.number(),
  embedding: z.array(z.number()),
});

export const SearchDocumentSchema = z.object({
  id: z.string(),
  type: z.enum(['interview', 'theme', 'quote']),
  interviewId: z.string(),
  title: z.string(),
  content: z.string(),
  demographics: z.string().optional(),
  category: z.string().optional(),
  sentiment: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const BuildMetadataSchema = z.object({
  buildId: z.string(),
  timestamp: z.string(),
  interviewCount: z.number(),
  embeddingDimension: z.number(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  artifactPaths: z.record(z.string()),
});

// ---- Admin schemas ----

export const ProcessingStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export const ApprovalStatusSchema = z.enum(['pending_review', 'approved', 'rejected']);

export const CreateInterviewRequestSchema = z.object({
  title: z.string(),
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
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
      })
      .optional(),
  });
