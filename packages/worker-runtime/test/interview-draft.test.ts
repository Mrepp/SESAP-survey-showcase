import { describe, expect, it } from 'vitest';
import { R2_PATHS } from '@sesap/types';
import type { Analysis, InterviewRecord } from '@sesap/types';
import { currentPromptStamp } from '@sesap/core';
import { applyInterviewDraft } from '../src/interview-draft';

function record(): InterviewRecord {
  return {
    id: 'int_draft000001',
    title: 'Before',
    demographics: { major: 'CS' },
    metadata: { interviewDate: '2026-01-01' },
    source: 'transcript',
    processing: { status: 'completed' },
    approval: { status: 'pending_review' },
    artifacts: { transcript: true, analysis: true, embeddings: true },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function analysis(): Analysis {
  return {
    interviewId: 'int_draft000001',
    modelConfig: { model: 'test', temperature: 0, maxTokens: 1 },
    summaries: [{ id: 'temp_1', summaryText: 'new', category: 'academic', confidence: 1 }],
    timeline: [],
    themes: [],
    quotes: [
      { id: 'int_draft000001_qt_0', quoteText: 'kept', context: '', sentiment: 'neutral', tags: [], themeIds: [] },
      { id: 'temp_9', quoteText: 'added', context: '', sentiment: 'neutral', tags: [], themeIds: [] },
    ],
    areasForImprovement: [],
    generatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('applyInterviewDraft', () => {
  it('touches only the slices present in the draft', async () => {
    const puts: string[] = [];
    const bucket = { put: async (key: string) => { puts.push(key); } };
    const rec = record();

    await applyInterviewDraft(bucket, rec, { title: 'After' });

    expect(rec.title).toBe('After');
    expect(rec.demographics).toEqual({ major: 'CS' });
    expect(puts).toEqual([]);
    expect(rec.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
  });

  it('mints real ids for editor-created items, stamps and stores the analysis', async () => {
    const puts: { key: string; value: string }[] = [];
    const bucket = { put: async (key: string, value: string) => { puts.push({ key, value }); } };
    const rec = record();

    const { analysis: saved } = await applyInterviewDraft(bucket, rec, { analysis: analysis() });

    expect(saved?.summaries[0].id).toBe('int_draft000001_sum_0');
    expect(saved?.quotes.map((q) => q.id)).toEqual(['int_draft000001_qt_0', 'int_draft000001_qt_1']);
    expect(saved?.promptVersion).toBe(currentPromptStamp.promptVersion);
    expect(rec.analysisStamp).toEqual(currentPromptStamp);
    expect(puts.map((p) => p.key)).toEqual([R2_PATHS.analysis(rec.id)]);
  });
});
