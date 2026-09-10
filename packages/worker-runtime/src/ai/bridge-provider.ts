import { WORKERS_AI_MODELS } from '../ai-budget';
import { normalizeLlmResponse } from './normalize';
import type { AiProviderEnv, SesapAi } from './types';
import { AiProviderError } from './types';

/**
 * Route LLM calls to a local HTTP bridge — `scripts/dev-ai-bridge.mjs`, which
 * shells out to the developer's own Claude Code. Real, varied analyses on
 * existing auth, at no Workers AI cost.
 *
 * The bridge answers whisper and embedding calls from fixtures (Claude Code can
 * neither transcribe audio nor embed), so this provider does not special-case
 * them — it forwards everything and normalizes what comes back.
 */
export function createBridgeAi(env: AiProviderEnv): SesapAi {
  const baseUrl = env.AI_BRIDGE_URL;
  if (!baseUrl) {
    throw new AiProviderError('AI_MODE is "bridge" but AI_BRIDGE_URL is not set', {
      hint: 'Set AI_BRIDGE_URL in the worker\'s .dev.vars, e.g. http://127.0.0.1:8799',
    });
  }

  const run: SesapAi['run'] = async (model, input = {}) => {
    let response: Response;
    try {
      response = await fetch(new URL('/run', baseUrl).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, input }),
      });
    } catch (err) {
      throw new AiProviderError(
        `Could not reach the local AI bridge at ${baseUrl} — is \`pnpm dev:ai-bridge\` running?`,
        { baseUrl, error: err instanceof Error ? err.message : String(err) },
      );
    }

    if (!response.ok) {
      throw new AiProviderError(`AI bridge returned ${response.status}`, {
        model,
        status: response.status,
        body: (await response.text()).slice(0, 500),
      });
    }

    const body = await response.json();
    return model === WORKERS_AI_MODELS.llm ? normalizeLlmResponse(body) : body;
  };

  return { run };
}
