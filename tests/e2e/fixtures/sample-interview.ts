import type {
  Interview,
  InterviewRecord,
  InterviewEmbeddings,
  Analysis,
  EmbeddingVector,
} from '@sesap/types';

export const FIXED_DIMENSION = 8;

function vec(seed: string, dim = FIXED_DIMENSION): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out: number[] = [];
  for (let i = 0; i < dim; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    out.push(((h >>> 0) % 1000) / 1000);
  }
  return out;
}

export interface FixtureOptions {
  id: string;
  title?: string;
  major?: string;
  tags?: string[];
  themes?: { id: string; title: string; description: string; category?: string }[];
  category?: string;
}

export function makeSampleInterview(opts: FixtureOptions): Interview {
  const id = opts.id;
  const title = opts.title ?? `Interview ${id}`;
  const tags = opts.tags ?? ['career', 'mentorship'];
  const themes = opts.themes ?? [
    {
      id: `${id}_thm_0`,
      title: 'Finding mentors',
      description: 'How the interviewee found supportive faculty.',
      category: opts.category ?? 'mentorship',
    },
  ];
  const category = opts.category ?? 'career';
  const now = '2026-01-01T00:00:00.000Z';

  const analysis: Analysis = {
    interviewId: id,
    modelConfig: { model: 'test', temperature: 0, maxTokens: 1000 },
    summaries: [
      {
        id: `${id}_sum_0`,
        summaryText: `${title}: a brief summary of the interview.`,
        category,
        confidence: 0.9,
      },
    ],
    timeline: [
      {
        id: `${id}_tl_0`,
        event: 'Started college',
        period: 'freshman fall',
        significance: 'Beginning of academic journey.',
        term: 'freshman_fall',
      },
    ],
    themes: themes.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category ?? category,
      frequency: 1,
      relatedQuoteIds: [`${id}_qt_0`],
    })),
    quotes: [
      {
        id: `${id}_qt_0`,
        quoteText: `A meaningful quote from ${title}.`,
        context: 'Discussing turning points.',
        sentiment: 'positive',
        tags,
        themeIds: themes.map((t) => t.id),
      },
    ],
    areasForImprovement: [
      {
        id: `${id}_afi_0`,
        area: 'Career services',
        description: 'Better career counseling availability.',
        category,
        priority: 'medium',
      },
    ],
    identities: [],
    generatedAt: now,
  };

  return {
    id,
    title,
    demographics: {
      college: 'Test University',
      graduationYear: '2024',
      major: opts.major ?? 'Computer Science',
    },
    transcript: {
      rawText: 'Q: Tell me about your experience? A: It was great, lots of mentorship.',
      validation: {
        wordCount: 14,
        hasQuestions: true,
        hasResponses: true,
        estimatedDuration: '1 minutes',
      },
    },
    metadata: {
      interviewDate: '2024-05-01',
      interviewer: 'Test Interviewer',
    },
    analysis,
    createdAt: now,
    updatedAt: now,
  };
}

export function makeRecord(interview: Interview): InterviewRecord {
  return {
    id: interview.id,
    title: interview.title,
    demographics: interview.demographics,
    metadata: interview.metadata,
    processing: { status: 'completed', completedAt: interview.updatedAt },
    approval: { status: 'approved', reviewedAt: interview.updatedAt },
    artifacts: { transcript: true, analysis: true, embeddings: true },
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  };
}

export function makeEmbeddings(interview: Interview): InterviewEmbeddings {
  const a = interview.analysis!;
  const vectors: EmbeddingVector[] = [];

  for (const s of a.summaries) {
    vectors.push({ id: s.id, type: 'summary', text: s.summaryText, embedding: vec(s.summaryText), dimension: FIXED_DIMENSION });
  }
  for (const t of a.themes) {
    vectors.push({ id: t.id, type: 'theme', text: `${t.title}: ${t.description}`, embedding: vec(t.title), dimension: FIXED_DIMENSION });
  }
  for (const q of a.quotes) {
    vectors.push({ id: q.id, type: 'quote', text: q.quoteText, embedding: vec(q.quoteText), dimension: FIXED_DIMENSION });
  }
  for (const tp of a.timeline) {
    vectors.push({ id: tp.id, type: 'timeline', text: tp.event, embedding: vec(tp.event), dimension: FIXED_DIMENSION });
  }
  for (const afi of a.areasForImprovement) {
    vectors.push({ id: afi.id, type: 'areaForImprovement', text: afi.area, embedding: vec(afi.area), dimension: FIXED_DIMENSION });
  }

  return {
    interviewId: interview.id,
    model: 'test',
    dimension: FIXED_DIMENSION,
    vectors,
    generatedAt: interview.updatedAt,
  };
}
