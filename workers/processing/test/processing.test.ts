import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAnalysis } from '../src/services/llm-service';
import { generateEmbeddings } from '../src/services/embedding-service';
import { extractChunksFromAnalysis, parseTranscript } from '../src/services/transcript-parser';
import { buildAnalysisPrompt } from '../src/prompts/analysis-prompt';
import type { Env } from '../src/bindings';
import type { Analysis } from '@sesap/types';
import { THEME_TITLES } from '@sesap/shared';

// -- Mock factories --

function createMockR2Bucket(): R2Bucket {
  const store = new Map<string, string>();
  return {
    put: vi.fn(async (key: string, value: string | ReadableStream | ArrayBuffer | Blob | null) => {
      store.set(key, typeof value === 'string' ? value : '');
      return {} as R2Object;
    }),
    get: vi.fn(async (key: string) => {
      const val = store.get(key);
      if (!val) return null;
      return {
        text: async () => val,
        json: async () => JSON.parse(val),
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
      } as unknown as R2ObjectBody;
    }),
    delete: vi.fn(),
    list: vi.fn(),
    head: vi.fn(),
    createMultipartUpload: vi.fn(),
    resumeMultipartUpload: vi.fn(),
  } as unknown as R2Bucket;
}

function createMockKVNamespace(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

const MOCK_LLM_RESPONSE = {
  summaries: [
    { summaryText: 'Student had a positive academic experience', category: 'academic', confidence: 0.9 },
    { summaryText: 'Strong social connections formed', category: 'social', confidence: 0.85 },
  ],
  timeline: [
    { event: 'Started college', period: 'freshman year', significance: 'Major life transition' },
    { event: 'Joined study group', period: 'sophomore year', significance: 'Improved academic performance' },
  ],
  themes: [
    { title: 'Academic Difficulty', description: 'Progressive improvement in studies', category: 'academic', frequency: 5, relatedQuoteIds: [] },
    { title: 'Belonging', description: 'Sense of belonging on campus', category: 'social', frequency: 3, relatedQuoteIds: [] },
  ],
  quotes: [
    { quoteText: 'College changed my life', context: 'Reflecting on overall experience', sentiment: 'positive', tags: ['academic', 'personal'], themeIds: [] },
    { quoteText: 'I found my people', context: 'Discussing social life', sentiment: 'positive', tags: ['social'], themeIds: [] },
  ],
  areasForImprovement: [
    { area: 'Mental Health Support', description: 'More counseling resources needed', category: 'mental_health', priority: 'high' },
  ],
};

function createMockEnv(llmResponse?: unknown): Env {
  return {
    AI: {
      run: vi.fn(async (model: string) => {
        if (model === '@cf/openai/gpt-oss-120b') {
          return { response: JSON.stringify(llmResponse ?? MOCK_LLM_RESPONSE) };
        }
        if (model === '@cf/baai/bge-small-en-v1.5') {
          // Return mock embeddings matching the number of text inputs
          const args = (createMockEnv as unknown as { _lastEmbeddingArgs?: { text: string[] } })._lastEmbeddingArgs;
          const count = args?.text?.length ?? 1;
          return {
            data: Array.from({ length: count }, () =>
              Array.from({ length: 384 }, () => Math.random()),
            ),
          };
        }
        return {};
      }),
    } as unknown as Ai,
    SESAP_BUCKET: createMockR2Bucket(),
    SESAP_KV: createMockKVNamespace(),
    ENVIRONMENT: 'test',
  };
}

// Refined mock that captures text input for embedding dimension
function createMockEnvWithEmbeddings(): Env {
  const aiRun = vi.fn(async (model: string, input: Record<string, unknown>) => {
    if (model === '@cf/openai/gpt-oss-120b') {
      return { response: JSON.stringify(MOCK_LLM_RESPONSE) };
    }
    if (model === '@cf/baai/bge-small-en-v1.5') {
      const texts = input.text as string[];
      return {
        data: Array.from({ length: texts.length }, () =>
          Array.from({ length: 384 }, () => Math.random()),
        ),
      };
    }
    return {};
  });

  return {
    AI: { run: aiRun } as unknown as Ai,
    SESAP_BUCKET: createMockR2Bucket(),
    SESAP_KV: createMockKVNamespace(),
    ENVIRONMENT: 'test',
  };
}

// -- Tests --

describe('analysis-prompt', () => {
  it('should include canonical theme titles from shared enum', () => {
    const prompt = buildAnalysisPrompt('Sample transcript');
    expect(prompt).toContain(`Must be one of: ${THEME_TITLES.join(' | ')}`);
    expect(prompt).toContain(`Theme titles MUST be selected exactly from this list: ${THEME_TITLES.join(', ')}`);
  });
});

describe('transcript-parser', () => {
  describe('parseTranscript', () => {
    it('should split transcript into paragraph chunks', () => {
      const transcript = `This is the first paragraph about college experience and what happened during freshman year.

This is the second paragraph about social life and clubs that the student joined.

Short.

This is the fourth paragraph about career goals and internships completed during junior year.`;

      const chunks = parseTranscript('int_test123', transcript);

      // "Short." is less than 20 chars, so it should be filtered out
      expect(chunks.length).toBe(3);
      expect(chunks[0].id).toBe('int_test123_raw_0');
      expect(chunks[0].type).toBe('summary');
      expect(chunks[0].text).toContain('first paragraph');
    });

    it('should return empty array for empty transcript', () => {
      const chunks = parseTranscript('int_test123', '');
      expect(chunks.length).toBe(0);
    });
  });

  describe('extractChunksFromAnalysis', () => {
    it('should extract all chunk types from analysis', () => {
      const analysis: Analysis = {
        interviewId: 'int_test123',
        modelConfig: { model: 'test', temperature: 0.3, maxTokens: 4096 },
        summaries: [{ id: 's1', summaryText: 'Summary text', category: 'academic', confidence: 0.9 }],
        timeline: [{ id: 't1', event: 'Event', period: 'year 1', significance: 'Important' }],
        themes: [{ id: 'th1', title: 'Belonging', description: 'Desc', category: 'social', frequency: 3, relatedQuoteIds: [] }],
        quotes: [{ id: 'q1', quoteText: 'A quote', context: 'Context', sentiment: 'positive', tags: [], themeIds: [] }],
        areasForImprovement: [{ id: 'a1', area: 'Area', description: 'Desc', category: 'academic', priority: 'high' }],
        generatedAt: new Date().toISOString(),
      };

      const chunks = extractChunksFromAnalysis('int_test123', analysis);

      expect(chunks.length).toBe(5);

      const types = chunks.map((c) => c.type);
      expect(types).toContain('summary');
      expect(types).toContain('timeline');
      expect(types).toContain('theme');
      expect(types).toContain('quote');
      expect(types).toContain('areaForImprovement');
    });

    it('should handle analysis with empty arrays', () => {
      const analysis: Analysis = {
        interviewId: 'int_test123',
        modelConfig: { model: 'test', temperature: 0.3, maxTokens: 4096 },
        summaries: [],
        timeline: [],
        themes: [],
        quotes: [],
        areasForImprovement: [],
        generatedAt: new Date().toISOString(),
      };

      const chunks = extractChunksFromAnalysis('int_test123', analysis);
      expect(chunks.length).toBe(0);
    });
  });
});

describe('llm-service', () => {
  it('should generate analysis from transcript', async () => {
    const env = createMockEnv();
    const analysis = await generateAnalysis(env, 'int_test123', 'This is a test transcript about college.');

    expect(analysis.interviewId).toBe('int_test123');
    expect(analysis.summaries.length).toBe(2);
    expect(analysis.themes.length).toBe(2);
    expect(analysis.quotes.length).toBe(2);
    expect(analysis.timeline.length).toBe(2);
    expect(analysis.areasForImprovement.length).toBe(1);

    // Verify IDs were assigned
    expect(analysis.summaries[0].id).toMatch(/^int_test123_summary_0$/);
    expect(analysis.themes[0].id).toMatch(/^int_test123_theme_0$/);
    expect(analysis.quotes[0].id).toMatch(/^int_test123_quote_0$/);
    expect(analysis.timeline[0].id).toMatch(/^int_test123_timeline_0$/);
    expect(analysis.areasForImprovement[0].id).toMatch(/^int_test123_area_0$/);

    // Verify model config
    expect(analysis.modelConfig.model).toBe('@cf/openai/gpt-oss-120b');
    expect(analysis.generatedAt).toBeDefined();
  });

  it('should retry on failure and succeed', async () => {
    let callCount = 0;
    const env: Env = {
      AI: {
        run: vi.fn(async () => {
          callCount++;
          if (callCount < 3) {
            throw new Error('Temporary failure');
          }
          return { response: JSON.stringify(MOCK_LLM_RESPONSE) };
        }),
      } as unknown as Ai,
      SESAP_BUCKET: createMockR2Bucket(),
      SESAP_KV: createMockKVNamespace(),
      ENVIRONMENT: 'test',
    };

    const analysis = await generateAnalysis(env, 'int_retry', 'test transcript');
    expect(analysis.interviewId).toBe('int_retry');
    expect(callCount).toBe(3);
  });

  it('should throw after max retries', async () => {
    const env: Env = {
      AI: {
        run: vi.fn(async () => {
          throw new Error('Persistent failure');
        }),
      } as unknown as Ai,
      SESAP_BUCKET: createMockR2Bucket(),
      SESAP_KV: createMockKVNamespace(),
      ENVIRONMENT: 'test',
    };

    await expect(generateAnalysis(env, 'int_fail', 'test transcript')).rejects.toThrow(
      'Failed to generate analysis after 3 attempts',
    );
  });
});

describe('embedding-service', () => {
  it('should generate embeddings for items', async () => {
    const env = createMockEnvWithEmbeddings();
    const items = [
      { id: 'item1', type: 'summary' as const, text: 'Summary text about college' },
      { id: 'item2', type: 'theme' as const, text: 'Theme about academics' },
      { id: 'item3', type: 'quote' as const, text: 'A direct quote from student' },
    ];

    const embeddings = await generateEmbeddings(env, 'int_test123', items);

    expect(embeddings.interviewId).toBe('int_test123');
    expect(embeddings.model).toBe('@cf/baai/bge-small-en-v1.5');
    expect(embeddings.dimension).toBe(384);
    expect(embeddings.vectors.length).toBe(3);

    for (const vector of embeddings.vectors) {
      expect(vector.embedding.length).toBe(384);
      expect(vector.dimension).toBe(384);
    }

    expect(embeddings.vectors[0].id).toBe('item1');
    expect(embeddings.vectors[0].type).toBe('summary');
    expect(embeddings.generatedAt).toBeDefined();
  });

  it('should handle empty items array', async () => {
    const env = createMockEnvWithEmbeddings();
    const embeddings = await generateEmbeddings(env, 'int_empty', []);

    expect(embeddings.vectors.length).toBe(0);
    expect(embeddings.interviewId).toBe('int_empty');
  });

  it('should batch items in groups of 50', async () => {
    const env = createMockEnvWithEmbeddings();
    const items = Array.from({ length: 75 }, (_, i) => ({
      id: `item${i}`,
      type: 'summary' as const,
      text: `Text chunk number ${i}`,
    }));

    const embeddings = await generateEmbeddings(env, 'int_batch', items);

    expect(embeddings.vectors.length).toBe(75);
    // Should have been called twice: once for 50, once for 25
    expect(env.AI.run).toHaveBeenCalledTimes(2);
  });
});
