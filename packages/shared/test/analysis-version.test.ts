import { describe, it, expect } from 'vitest';
import {
  ANALYSIS_PROMPT_HASH,
  ANALYSIS_PROMPT_VERSION,
  ANALYSIS_SCHEMA_VERSION,
  isAnalysisStale,
  currentPromptStamp,
} from '../src/analysis-version';

describe('analysis-version', () => {
  // Pinning these forces a deliberate version bump whenever the prompt or
  // schema is modified. If this test fails, update both the version constant
  // and this expected hash in the same change.
  it('prompt hash is pinned', () => {
    expect(ANALYSIS_PROMPT_HASH).toBe('23ec1ea5');
    expect(ANALYSIS_PROMPT_VERSION).toBe('2026-04-29.3');
    expect(ANALYSIS_SCHEMA_VERSION).toBe('2.1.0');
  });

  it('isAnalysisStale flags missing stamps', () => {
    expect(isAnalysisStale(undefined).stale).toBe(true);
    expect(isAnalysisStale(null).stale).toBe(true);
    expect(isAnalysisStale({}).reasons).toEqual(
      expect.arrayContaining(['missing_prompt_hash', 'missing_prompt_version', 'missing_schema_version']),
    );
  });

  it('isAnalysisStale flags promptVersion drift', () => {
    const result = isAnalysisStale({ ...currentPromptStamp, promptVersion: 'old' });
    expect(result.stale).toBe(true);
    expect(result.reasons).toContain('prompt_version_drift');
  });

  it('isAnalysisStale flags promptHash drift', () => {
    const result = isAnalysisStale({ ...currentPromptStamp, promptHash: 'deadbeef' });
    expect(result.stale).toBe(true);
    expect(result.reasons).toContain('prompt_drift');
  });

  it('isAnalysisStale returns clean for matching stamp', () => {
    expect(isAnalysisStale(currentPromptStamp)).toEqual({ stale: false, reasons: [] });
  });
});
