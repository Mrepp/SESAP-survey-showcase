import { isDevelopment } from '@sesap/core';
import { createBridgeAi } from './bridge-provider';
import { createFixtureAi } from './fixture-provider';
import { isLlmModel, normalizeLlmResponse } from './normalize';
import type { AiMode, AiProviderEnv, AiProviderFactory, SesapAi } from './types';
import { AI_MODES, AiProviderError, DEFAULT_AI_MODE } from './types';

export * from './normalize';
export * from './types';

/**
 * Build-time switch for the development-only providers.
 *
 * Every deploy template sets `[define] SESAP_DEV_PROVIDERS = "false"`. Wrangler
 * hands that to esbuild, which replaces the identifier with the literal and
 * drops the `if` block below — and with it the fixture and bridge providers and
 * the canned transcript and analysis they import. Local `wrangler.toml` files
 * set it to `"true"`.
 *
 * Builds with no define at all (vitest, the e2e pool) get the default below:
 * enabled. The `in` check uses a string, which a define does not touch, so in
 * a defined build it only ever adds an unused global.
 */
declare const SESAP_DEV_PROVIDERS: boolean;

if (!('SESAP_DEV_PROVIDERS' in globalThis)) {
  Object.defineProperty(globalThis, 'SESAP_DEV_PROVIDERS', { value: true, configurable: true });
}

/** The real Workers AI binding, with LLM responses normalized on the way out. */
function createLiveAi(env: AiProviderEnv): SesapAi {
  const binding = env.AI;
  if (!binding) {
    throw new AiProviderError('AI_MODE is "live" but no AI binding is configured', {
      hint: 'Add `[ai]\\nbinding = "AI"` to the worker\'s wrangler config.',
    });
  }

  return {
    async run(model, input) {
      // The single place the string model id meets workers-types' overload map.
      const raw = await binding.run(model as Parameters<Ai['run']>[0], input as never);
      return isLlmModel(model) ? normalizeLlmResponse(raw) : raw;
    },
  };
}

/**
 * One entry per mode. Adding a provider is a new file plus a line here —
 * nothing at the call sites changes.
 */
const PROVIDERS: Record<AiMode, AiProviderFactory> = {
  live: createLiveAi,
  fixture: refuseCompiledOut,
  bridge: refuseCompiledOut,
};

if (SESAP_DEV_PROVIDERS) {
  PROVIDERS.fixture = createFixtureAi;
  PROVIDERS.bridge = createBridgeAi;
}

function refuseCompiledOut(env: AiProviderEnv): SesapAi {
  throw new AiProviderError(
    `AI_MODE "${env.AI_MODE}" is not available in this build (SESAP_DEV_PROVIDERS is off)`,
    { mode: env.AI_MODE },
  );
}

export function readAiMode(env: AiProviderEnv): AiMode {
  const raw = env.AI_MODE?.trim();
  if (!raw) return DEFAULT_AI_MODE;
  if (!(AI_MODES as readonly string[]).includes(raw)) {
    throw new AiProviderError(`Unknown AI_MODE ${JSON.stringify(raw)}`, {
      value: raw,
      allowed: AI_MODES,
    });
  }
  return raw as AiMode;
}

/**
 * The AI provider this worker should use, per `AI_MODE`.
 *
 * Every substitute mode is refused outside development, loudly. A fixture
 * analysis written into staging data would be indistinguishable from a real one
 * after the fact, so this is a hard failure rather than a warning-and-fallback.
 */
export function resolveAi(env: AiProviderEnv): SesapAi {
  const mode = readAiMode(env);

  if (mode !== 'live' && !isDevelopment(env)) {
    throw new AiProviderError(
      `AI_MODE "${mode}" is only allowed when ENVIRONMENT is "development" (got "${env.ENVIRONMENT}")`,
      { mode, environment: env.ENVIRONMENT },
    );
  }

  return PROVIDERS[mode](env);
}
