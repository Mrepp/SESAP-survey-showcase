import { SesapError } from '@sesap/core';
import { WORKERS_AI_MODELS } from '../ai-budget';

/**
 * Where a worker's AI calls actually go.
 *
 * - `live`    — the real Workers AI binding. Costs neurons. The default.
 * - `fixture` — canned responses from `@sesap/dev-fixtures`. No network.
 * - `bridge`  — the developer's own Claude Code, via `scripts/dev-ai-bridge.mjs`.
 *
 * Only `live` is permitted outside `ENVIRONMENT = "development"`.
 */
export type AiMode = 'live' | 'fixture' | 'bridge';

export const AI_MODES = ['live', 'fixture', 'bridge'] as const;

export const DEFAULT_AI_MODE: AiMode = 'live';

/** One of the three models the pipeline calls. */
export type WorkersAiModel = (typeof WORKERS_AI_MODELS)[keyof typeof WORKERS_AI_MODELS];

/**
 * The contract every provider honours and every call site programs against.
 *
 * Deliberately not `Ai` from workers-types: that type is a per-model overload
 * map only the real binding can satisfy. Providers used to be forced into it
 * with `as unknown as Ai`, and callers then cast the model and the result back
 * out. The live provider does the one cast, here, where the mismatch is real.
 */
export interface SesapAi {
  run(model: WorkersAiModel, input: Record<string, unknown>): Promise<unknown>;
}

/** The slice of a worker `Env` the provider registry reads. */
export interface AiProviderEnv {
  AI?: Ai;
  ENVIRONMENT: string;
  /** Unset means {@link DEFAULT_AI_MODE}, so a deploy is unaffected by omission. */
  AI_MODE?: string;
  /** Only read in `bridge` mode. */
  AI_BRIDGE_URL?: string;
}

export class AiProviderError extends SesapError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_PROVIDER_CONFIG_ERROR', 503, details);
    this.name = 'AiProviderError';
  }
}

/** Builds the provider for one mode. */
export type AiProviderFactory = (env: AiProviderEnv) => SesapAi;
