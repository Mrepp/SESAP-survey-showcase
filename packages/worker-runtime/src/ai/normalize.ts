import { WORKERS_AI_MODELS } from '../ai-budget';

/**
 * Scan for the first balanced top-level JSON object and return it as a string,
 * or null if there is none. Reasoning models sometimes spend the whole token
 * budget reasoning, leaving `content` null with the JSON buried inside
 * `reasoning_content`.
 */
export function extractFirstJsonObject(input: string): string | null {
  const start = input.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < input.length; i++) {
    const ch = input[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }
  return null;
}

interface RawLlmResponse {
  response?: string;
  choices?: Array<{ message?: { content?: string | null; reasoning_content?: string | null } }>;
}

/**
 * Reduce every shape an LLM answer arrives in to a single `response` string.
 *
 * Cloudflare-native models return `response`; OpenAI-compatible ones return
 * `choices[].message.content`; reasoning models sometimes leave that null with
 * the JSON embedded in `reasoning_content`. Doing this in the provider layer —
 * rather than at the call site — is what lets the fixture and bridge providers
 * answer in one shape and still be indistinguishable to the caller.
 */
export function normalizeLlmResponse(raw: unknown): { response: string } & Record<string, unknown> {
  const value = (raw ?? {}) as RawLlmResponse & Record<string, unknown>;

  let text = value.response ?? value.choices?.[0]?.message?.content ?? '';
  if (!text) {
    const reasoning = value.choices?.[0]?.message?.reasoning_content ?? '';
    text = extractFirstJsonObject(reasoning) ?? '';
  }

  return { ...value, response: text };
}

/** True for the model whose responses {@link normalizeLlmResponse} applies to. */
export function isLlmModel(model: string): boolean {
  return model === WORKERS_AI_MODELS.llm;
}
