import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { AnalysisSchema, currentPromptStamp, isAnalysisStale } from '@sesap/core';
import {
  EMBEDDING_DIMENSION,
  FIXTURE_TRANSCRIPT,
  buildSeedInterviews,
  deterministicEmbedding,
  makeFixtureAnalysis,
  makeSampleInterview,
  makeEmbeddings,
} from '../src';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

describe('the canned analysis', () => {
  it('validates against the real AnalysisSchema', () => {
    // The fixture is held to the same contract as a Workers AI response: if a
    // required field is added to the schema, this fails rather than seeding
    // records the rest of the app cannot read.
    expect(() => AnalysisSchema.parse(makeFixtureAnalysis('int_test00000001'))).not.toThrow();
  });

  it('carries the current prompt stamp, so it does not read as stale', () => {
    const analysis = makeFixtureAnalysis('int_test00000001');
    expect(isAnalysisStale(analysis, currentPromptStamp).stale).toBe(false);
  });

  it('mints ids under the interview it was asked for', () => {
    const analysis = makeFixtureAnalysis('int_abcdefabcdef');
    expect(analysis.interviewId).toBe('int_abcdefabcdef');
    for (const quote of analysis.quotes) expect(quote.id).toMatch(/^int_abcdefabcdef_quote_\d+$/);
  });

  it('cross-references only ids it actually defines', () => {
    const analysis = makeFixtureAnalysis('int_test00000001');
    const themeIds = new Set(analysis.themes.map((theme) => theme.id));
    const quoteIds = new Set(analysis.quotes.map((quote) => quote.id));
    const timelineIds = new Set(analysis.timeline.map((point) => point.id));

    for (const theme of analysis.themes) {
      for (const id of theme.relatedQuoteIds) expect(quoteIds).toContain(id);
    }
    for (const quote of analysis.quotes) {
      for (const id of quote.themeIds) expect(themeIds).toContain(id);
      if (quote.timelineEventId) expect(timelineIds).toContain(quote.timelineEventId);
    }
  });
});

describe('fixture embeddings', () => {
  it('are the width of the model the pipeline actually uses', () => {
    expect(EMBEDDING_DIMENSION).toBe(384);
    expect(deterministicEmbedding('anything')).toHaveLength(384);
  });

  it('are deterministic and text-dependent', () => {
    expect(deterministicEmbedding('a')).toEqual(deterministicEmbedding('a'));
    expect(deterministicEmbedding('a')).not.toEqual(deterministicEmbedding('b'));
  });

  it('stay inside the unit interval', () => {
    for (const value of deterministicEmbedding('bounds')) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('give every vector of a sample interview the declared dimension', () => {
    const embeddings = makeEmbeddings(makeSampleInterview({ id: 'int_sample000001' }));
    expect(embeddings.dimension).toBe(EMBEDDING_DIMENSION);
    for (const vector of embeddings.vectors) {
      expect(vector.embedding).toHaveLength(EMBEDDING_DIMENSION);
    }
  });
});

describe('the seed manifest', () => {
  const fixtures = buildSeedInterviews();

  it('covers the lifecycle states a developer needs to see', () => {
    const states = fixtures.map((fixture) => fixture.record.approval.status);
    expect(states).toContain('approved');
    expect(states).toContain('pending_submitter_review');
    expect(states).toContain('pending_review');
    expect(fixtures.map((f) => f.record.processing.status)).toContain('failed');
  });

  it('gives exactly one interview a review token, and it is self-service', () => {
    const withToken = fixtures.filter((fixture) => fixture.reviewToken);
    expect(withToken).toHaveLength(1);
    expect(withToken[0].record.origin).toBe('self_service');
    expect(withToken[0].record.approval.status).toBe('pending_submitter_review');
  });

  it('claims no artifact it does not also write', () => {
    for (const fixture of fixtures) {
      const { artifacts } = fixture.record;
      expect(artifacts.transcript).toBe(Boolean(fixture.transcript));
      expect(artifacts.analysis).toBe(Boolean(fixture.analysis));
      expect(artifacts.embeddings).toBe(Boolean(fixture.embeddings));
    }
  });

  it('produces analyses that validate', () => {
    for (const fixture of fixtures) {
      if (fixture.analysis) expect(() => AnalysisSchema.parse(fixture.analysis)).not.toThrow();
    }
  });
});

describe('canned transcripts', () => {
  it('match tests/fixtures/interview1.txt, which they stand in for', () => {
    const onDisk = readFileSync(path.join(repoRoot, 'tests', 'fixtures', 'interview1.txt'), 'utf8');
    expect(FIXTURE_TRANSCRIPT.trim()).toBe(onDisk.trim());
  });
});
