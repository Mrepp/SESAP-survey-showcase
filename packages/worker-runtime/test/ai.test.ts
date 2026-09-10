import { describe, expect, it, vi } from 'vitest';
import {
  AiProviderError,
  WORKERS_AI_MODELS,
  normalizeLlmResponse,
  readAiMode,
  resolveAi,
} from '../src';

function env(overrides: Record<string, unknown> = {}) {
  return {
    ENVIRONMENT: 'development',
    AI: { run: vi.fn(async () => ({ response: 'from workers ai' })) },
    ...overrides,
  } as never;
}

describe('readAiMode', () => {
  it('defaults to live so an unset AI_MODE leaves a deploy unchanged', () => {
    expect(readAiMode(env({ AI_MODE: undefined }))).toBe('live');
    expect(readAiMode(env({ AI_MODE: '  ' }))).toBe('live');
  });

  it('accepts each known mode', () => {
    for (const mode of ['live', 'fixture', 'bridge']) {
      expect(readAiMode(env({ AI_MODE: mode }))).toBe(mode);
    }
  });

  it('rejects an unknown mode rather than falling back', () => {
    expect(() => readAiMode(env({ AI_MODE: 'mock' }))).toThrow(AiProviderError);
  });
});

describe('resolveAi', () => {
  it('uses the real binding in live mode', async () => {
    const binding = { run: vi.fn(async () => ({ data: [[1, 2, 3]] })) };
    const ai = resolveAi(env({ AI: binding, AI_MODE: 'live' }));

    await ai.run(WORKERS_AI_MODELS.embedding, { text: ['hi'] });

    expect(binding.run).toHaveBeenCalledWith(WORKERS_AI_MODELS.embedding, { text: ['hi'] });
  });

  it('answers from fixtures without touching the binding', async () => {
    const binding = { run: vi.fn() };
    const ai = resolveAi(env({ AI: binding, AI_MODE: 'fixture' }));

    const result = (await ai.run(WORKERS_AI_MODELS.whisper, {})) as { text: string };

    expect(result.text.length).toBeGreaterThan(0);
    expect(binding.run).not.toHaveBeenCalled();
  });

  it.each(['staging', 'production'])(
    'refuses a substitute provider in %s',
    (environment) => {
      expect(() => resolveAi(env({ ENVIRONMENT: environment, AI_MODE: 'fixture' }))).toThrow(
        /only allowed when ENVIRONMENT is "development"/,
      );
    },
  );

  it('still allows live mode outside development', () => {
    expect(() => resolveAi(env({ ENVIRONMENT: 'production', AI_MODE: 'live' }))).not.toThrow();
  });

  it('fails loudly when bridge mode has no URL', () => {
    expect(() => resolveAi(env({ AI_MODE: 'bridge', AI_BRIDGE_URL: undefined }))).toThrow(
      AiProviderError,
    );
  });

  it('fails loudly when live mode has no binding', () => {
    expect(() => resolveAi(env({ AI: undefined }))).toThrow(AiProviderError);
  });
});

describe('normalizeLlmResponse', () => {
  it('passes through a Cloudflare-native response', () => {
    expect(normalizeLlmResponse({ response: '{"a":1}' }).response).toBe('{"a":1}');
  });

  it('unwraps an OpenAI-compatible choices array', () => {
    expect(
      normalizeLlmResponse({ choices: [{ message: { content: '{"a":1}' } }] }).response,
    ).toBe('{"a":1}');
  });

  it('recovers the JSON object a reasoning model buried in reasoning_content', () => {
    const raw = {
      choices: [
        {
          message: {
            content: null,
            reasoning_content: 'Let me think... {"a": {"b": "}"}} and then some trailing prose.',
          },
        },
      ],
    };
    expect(normalizeLlmResponse(raw).response).toBe('{"a": {"b": "}"}}');
  });

  it('yields an empty string when there is nothing to unwrap', () => {
    expect(normalizeLlmResponse({}).response).toBe('');
  });

  it('normalizes through the live provider, so callers see one shape', async () => {
    const binding = {
      run: vi.fn(async () => ({ choices: [{ message: { content: '{"ok":true}' } }] })),
    };
    const ai = resolveAi(env({ AI: binding }));

    const result = (await ai.run(WORKERS_AI_MODELS.llm, {})) as { response: string };

    expect(result.response).toBe('{"ok":true}');
  });
});
