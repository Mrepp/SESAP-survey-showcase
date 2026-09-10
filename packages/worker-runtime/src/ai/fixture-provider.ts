// Imported by subpath rather than from the barrel, so that even in a build
// where this provider is kept (SESAP_DEV_PROVIDERS on) only the fixture
// analysis, transcript and embedding modules come along — never
// seed-manifest.ts, which carries the fixed dev review token and dev addresses.
// Deploy templates turn SESAP_DEV_PROVIDERS off, and then this whole module is
// dropped from the bundle; CI asserts that.
import { makeFixtureAnalysis } from '@sesap/dev-fixtures/analysis';
import { EMBEDDING_DIMENSION, deterministicEmbedding } from '@sesap/dev-fixtures/embedding';
import { FIXTURE_TRANSCRIPT_LONG } from '@sesap/dev-fixtures/transcripts';
import { WORKERS_AI_MODELS } from '../ai-budget';
import type { AiProviderEnv, SesapAi } from './types';
import { AiProviderError } from './types';

/** The id the canned analysis is minted under; the caller re-mints its own. */
const FIXTURE_INTERVIEW_ID = 'int_fixture00000';

/**
 * Canned Workers AI. Returns the same response shapes the real binding does,
 * so nothing downstream — including `runWithAiBudget`, which still reserves and
 * settles around these calls — can tell the difference.
 */
export function createFixtureAi(_env: AiProviderEnv): SesapAi {
  const run: SesapAi['run'] = async (model, input = {}) => {
    switch (model) {
      case WORKERS_AI_MODELS.llm:
        return { response: JSON.stringify(makeFixtureAnalysis(FIXTURE_INTERVIEW_ID)) };

      case WORKERS_AI_MODELS.whisper:
        return { text: FIXTURE_TRANSCRIPT_LONG };

      case WORKERS_AI_MODELS.embedding: {
        const text = input.text;
        const texts = Array.isArray(text) ? (text as string[]) : [String(text ?? '')];
        return {
          shape: [texts.length, EMBEDDING_DIMENSION],
          data: texts.map((item) => deterministicEmbedding(item, EMBEDDING_DIMENSION)),
        };
      }

      default:
        throw new AiProviderError(`No fixture response for model ${model}`, { model });
    }
  };

  return { run };
}
