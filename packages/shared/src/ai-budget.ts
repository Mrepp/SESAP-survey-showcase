import { KV_KEYS } from '@sesap/types';
import { SesapError } from './errors';

export const AI_NEURON_LIMITER_DO_NAME = 'global';

export const WORKERS_AI_MODELS = {
  llm: '@cf/openai/gpt-oss-120b',
  embedding: '@cf/baai/bge-small-en-v1.5',
  whisper: '@cf/openai/whisper-large-v3-turbo',
} as const;

export const WORKERS_AI_NEURON_RATES = {
  [WORKERS_AI_MODELS.llm]: {
    inputPerMillionTokens: 31818,
    outputPerMillionTokens: 68182,
  },
  [WORKERS_AI_MODELS.embedding]: {
    inputPerMillionTokens: 1841,
  },
  [WORKERS_AI_MODELS.whisper]: {
    perAudioMinute: 46.63,
  },
} as const;

const TOKEN_CHARS = 4;
const MILLION = 1_000_000;
const FALLBACK_AUDIO_BYTES_PER_SECOND = 8_000;
const MIN_WHISPER_MINUTES = 1;

type JsonRecord = Record<string, unknown>;

interface DurableObjectStubLike {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStubLike;
}

interface DurableObjectStorageLike {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  list<T = unknown>(options?: { prefix?: string }): Promise<Map<string, T>>;
  transaction<T>(closure: (txn: DurableObjectStorageLike) => Promise<T>): Promise<T>;
}

interface DurableObjectStateLike {
  storage: DurableObjectStorageLike;
}

interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface AiBudgetEnv {
  SESAP_KV: KVNamespaceLike;
  AI_NEURON_LIMITER: DurableObjectNamespaceLike;
}

export class AiBudgetError extends SesapError {
  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message, code, statusCode, details);
    this.name = 'AiBudgetError';
  }
}

export class AiBudgetExceededError extends AiBudgetError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_BUDGET_EXCEEDED', 429, details);
    this.name = 'AiBudgetExceededError';
  }
}

export class AiBudgetConfigError extends AiBudgetError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_BUDGET_CONFIG_ERROR', 503, details);
    this.name = 'AiBudgetConfigError';
  }
}

export type AiBudgetEstimate =
  | {
    kind: 'llm';
    model: typeof WORKERS_AI_MODELS.llm;
    messages: Array<{ role?: string; content?: unknown }>;
    maxTokens: number;
  }
  | {
    kind: 'embedding';
    model: typeof WORKERS_AI_MODELS.embedding;
    text: string | string[];
  }
  | {
    kind: 'whisper';
    model: typeof WORKERS_AI_MODELS.whisper;
    audioByteLength: number;
    durationSeconds?: number;
  };

export interface AiBudgetRequest {
  model: string;
  estimate: AiBudgetEstimate;
  context?: JsonRecord;
}

interface ReserveResponse {
  ok: boolean;
  reservationId?: string;
  date?: string;
  estimatedNeurons?: number;
  maxNeurons?: number;
  remainingNeurons?: number;
  error?: string;
  code?: string;
  details?: unknown;
}

interface LimiterState {
  date: string;
  maxNeurons: number;
  reservedNeurons: number;
  consumedNeurons: number;
  updatedAt: string;
}

interface Reservation {
  id: string;
  date: string;
  model: string;
  neurons: number;
  context?: JsonRecord;
  createdAt: string;
}

export function estimateTextTokens(text: string | string[]): number {
  const totalChars = Array.isArray(text)
    ? text.reduce((sum, item) => sum + item.length, 0)
    : text.length;
  return Math.max(1, Math.ceil(totalChars / TOKEN_CHARS));
}

export function estimateLlmNeurons(input: Extract<AiBudgetEstimate, { kind: 'llm' }>): number {
  const promptText = input.messages.map((message) => contentToText(message.content)).join('\n');
  const inputTokens = estimateTextTokens(promptText);
  const outputTokens = Math.max(1, input.maxTokens);
  const rates = WORKERS_AI_NEURON_RATES[input.model];
  return Math.ceil(
    (inputTokens * rates.inputPerMillionTokens) / MILLION +
    (outputTokens * rates.outputPerMillionTokens) / MILLION,
  );
}

export function estimateEmbeddingNeurons(input: Extract<AiBudgetEstimate, { kind: 'embedding' }>): number {
  const inputTokens = estimateTextTokens(input.text);
  const rates = WORKERS_AI_NEURON_RATES[input.model];
  return Math.ceil((inputTokens * rates.inputPerMillionTokens) / MILLION);
}

export function estimateWhisperNeurons(input: Extract<AiBudgetEstimate, { kind: 'whisper' }>): number {
  const seconds = input.durationSeconds ??
    input.audioByteLength / FALLBACK_AUDIO_BYTES_PER_SECOND;
  const minutes = Math.max(MIN_WHISPER_MINUTES, seconds / 60);
  const rates = WORKERS_AI_NEURON_RATES[input.model];
  return Math.ceil(minutes * rates.perAudioMinute);
}

export function estimateAiRunNeurons(estimate: AiBudgetEstimate): number {
  if (estimate.kind === 'llm') return estimateLlmNeurons(estimate);
  if (estimate.kind === 'embedding') return estimateEmbeddingNeurons(estimate);
  return estimateWhisperNeurons(estimate);
}

export async function runWithAiBudget<T>(
  env: AiBudgetEnv,
  request: AiBudgetRequest,
  run: () => Promise<T>,
): Promise<T> {
  const estimatedNeurons = estimateAiRunNeurons(request.estimate);
  const reservation = await reserveAiNeurons(env, {
    model: request.model,
    neurons: estimatedNeurons,
    context: request.context,
  });

  try {
    const result = await run();
    await settleAiNeuronReservation(env, 'consume', reservation.reservationId);
    return result;
  } catch (err) {
    try {
      await settleAiNeuronReservation(env, 'release', reservation.reservationId);
    } catch {
      // Preserve the original Workers AI failure; a stuck reservation keeps the limiter conservative.
    }
    throw err;
  }
}

export class AiNeuronLimiter {
  constructor(
    private state: DurableObjectStateLike,
    private env: { SESAP_KV: KVNamespaceLike },
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (request.method === 'POST' && url.pathname === '/reserve') {
        return await this.reserve((await request.json()) as JsonRecord);
      }
      if (request.method === 'POST' && url.pathname === '/consume') {
        return await this.settle((await request.json()) as JsonRecord, 'consume');
      }
      if (request.method === 'POST' && url.pathname === '/release') {
        return await this.settle((await request.json()) as JsonRecord, 'release');
      }
      if (request.method === 'GET' && url.pathname === '/status') {
        const state = await this.getCurrentState(await this.readMaxNeurons());
        return json({ ok: true, ...state });
      }
      return json({ ok: false, error: 'Not found' }, 404);
    } catch (err) {
      if (err instanceof AiBudgetConfigError) {
        return json({ ok: false, code: err.code, error: err.message, details: err.details }, err.statusCode);
      }
      return json(
        { ok: false, code: 'AI_BUDGET_LIMITER_ERROR', error: err instanceof Error ? err.message : String(err) },
        500,
      );
    }
  }

  private async reserve(body: JsonRecord): Promise<Response> {
    const neurons = readPositiveInteger(body.neurons, 'neurons');
    const model = typeof body.model === 'string' ? body.model : 'unknown';
    const context = isJsonRecord(body.context) ? body.context : undefined;
    const maxNeurons = await this.readMaxNeurons();
    const now = new Date();
    const date = utcDate(now);

    return this.state.storage.transaction(async (txn) => {
      const current = await getState(txn, date, maxNeurons, now);
      const totalCommitted = current.reservedNeurons + current.consumedNeurons;
      if (totalCommitted + neurons > maxNeurons) {
        return json({
          ok: false,
          code: 'AI_BUDGET_EXCEEDED',
          error: 'Workers AI daily neuron budget exhausted',
          details: {
            date,
            model,
            requestedNeurons: neurons,
            maxNeurons,
            reservedNeurons: current.reservedNeurons,
            consumedNeurons: current.consumedNeurons,
            remainingNeurons: Math.max(0, maxNeurons - totalCommitted),
          },
        }, 429);
      }

      const reservation: Reservation = {
        id: crypto.randomUUID(),
        date,
        model,
        neurons,
        context,
        createdAt: now.toISOString(),
      };
      current.reservedNeurons += neurons;
      current.updatedAt = now.toISOString();
      await txn.put('state', current);
      await txn.put(reservationKey(reservation.id), reservation);
      await this.writeSnapshot(current);

      return json({
        ok: true,
        reservationId: reservation.id,
        date,
        estimatedNeurons: neurons,
        maxNeurons,
        remainingNeurons: Math.max(0, maxNeurons - current.reservedNeurons - current.consumedNeurons),
      });
    });
  }

  private async settle(body: JsonRecord, action: 'consume' | 'release'): Promise<Response> {
    const reservationId = typeof body.reservationId === 'string' ? body.reservationId : '';
    if (!reservationId) {
      return json({ ok: false, code: 'AI_BUDGET_BAD_REQUEST', error: 'reservationId is required' }, 400);
    }

    const maxNeurons = await this.readMaxNeurons();
    const now = new Date();
    const date = utcDate(now);

    return this.state.storage.transaction(async (txn) => {
      const current = await getState(txn, date, maxNeurons, now);
      const reservation = await txn.get<Reservation>(reservationKey(reservationId));
      if (!reservation || reservation.date !== current.date) {
        return json({ ok: true, ignored: true });
      }

      current.reservedNeurons = Math.max(0, current.reservedNeurons - reservation.neurons);
      if (action === 'consume') {
        current.consumedNeurons += reservation.neurons;
      }
      current.updatedAt = now.toISOString();

      await txn.delete(reservationKey(reservationId));
      await txn.put('state', current);
      await this.writeSnapshot(current);

      return json({ ok: true, ...current });
    });
  }

  private async readMaxNeurons(): Promise<number> {
    const raw = await this.env.SESAP_KV.get(KV_KEYS.aiNeuronsDailyMax);
    const max = raw === null ? NaN : Number(raw);
    if (!Number.isFinite(max) || max <= 0) {
      throw new AiBudgetConfigError(
        `Missing or invalid Workers AI daily neuron budget in KV key ${KV_KEYS.aiNeuronsDailyMax}`,
        { key: KV_KEYS.aiNeuronsDailyMax, value: raw },
      );
    }
    return Math.floor(max);
  }

  private async getCurrentState(maxNeurons: number): Promise<LimiterState> {
    return getState(this.state.storage, utcDate(new Date()), maxNeurons, new Date());
  }

  private async writeSnapshot(state: LimiterState): Promise<void> {
    await this.env.SESAP_KV.put(KV_KEYS.aiNeuronsDailyUsage(state.date), JSON.stringify(state));
  }
}

async function reserveAiNeurons(
  env: AiBudgetEnv,
  body: { model: string; neurons: number; context?: JsonRecord },
): Promise<{ reservationId: string }> {
  const res = await limiterFetch(env, '/reserve', body);
  const payload = await res.json() as ReserveResponse;
  if (!res.ok || !payload.ok || !payload.reservationId) {
    throw budgetErrorFromResponse(payload, res.status);
  }
  return { reservationId: payload.reservationId };
}

async function settleAiNeuronReservation(
  env: AiBudgetEnv,
  action: 'consume' | 'release',
  reservationId: string,
): Promise<void> {
  const res = await limiterFetch(env, `/${action}`, { reservationId });
  if (!res.ok) {
    const payload = await res.json() as ReserveResponse;
    throw budgetErrorFromResponse(payload, res.status);
  }
}

function limiterFetch(env: AiBudgetEnv, path: string, body: JsonRecord): Promise<Response> {
  const id = env.AI_NEURON_LIMITER.idFromName(AI_NEURON_LIMITER_DO_NAME);
  const stub = env.AI_NEURON_LIMITER.get(id);
  return stub.fetch(`https://ai-neuron-limiter${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function budgetErrorFromResponse(payload: ReserveResponse, status: number): AiBudgetError {
  if (payload.code === 'AI_BUDGET_EXCEEDED' || status === 429) {
    return new AiBudgetExceededError(payload.error ?? 'Workers AI daily neuron budget exhausted', payload.details);
  }
  return new AiBudgetConfigError(payload.error ?? 'Workers AI budget limiter is not configured', payload.details);
}

async function getState(
  storage: DurableObjectStorageLike,
  date: string,
  maxNeurons: number,
  now: Date,
): Promise<LimiterState> {
  const current = await storage.get<LimiterState>('state');
  if (!current || current.date !== date) {
    return {
      date,
      maxNeurons,
      reservedNeurons: 0,
      consumedNeurons: 0,
      updatedAt: now.toISOString(),
    };
  }
  if (current.maxNeurons !== maxNeurons) {
    current.maxNeurons = maxNeurons;
    current.updatedAt = now.toISOString();
    await storage.put('state', current);
  }
  return current;
}

function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content === null || content === undefined) return '';
  return JSON.stringify(content) ?? String(content);
}

function utcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function reservationKey(id: string): string {
  return `reservation:${id}`;
}

function readPositiveInteger(value: unknown, field: string): number {
  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new AiBudgetConfigError(`Invalid ${field}`, { [field]: value });
  }
  return Math.ceil(numberValue);
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
