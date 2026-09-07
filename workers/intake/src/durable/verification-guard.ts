import { timingSafeEqual } from '@sesap/core';

/**
 * Verification state for one email address.
 *
 * One Durable Object instance per address (`idFromName(email)`), so issuing a
 * code, counting a wrong guess and consuming the right one are serialized by
 * the platform. The old KV implementation read `attempts`, added one and wrote
 * it back; guesses arriving in parallel at different colos each saw the same
 * count, and the cap that "actually protects an account" was soft.
 *
 * Only the code's hash is ever stored. Expiry is checked on read; an alarm
 * clears the row afterwards so an abandoned address leaves nothing behind.
 */

export interface VerificationRecord {
  codeHash: string;
  attempts: number;
  issuedAt: string;
  expiresAt: string;
}

export type ConfirmResult =
  | { ok: true }
  | { ok: false; reason: 'expired' | 'attempts_exhausted' | 'mismatch' };

interface StorageLike {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  deleteAll?(): Promise<void>;
  setAlarm?(scheduledTime: number | Date): Promise<void>;
}

interface StateLike {
  storage: StorageLike;
}

const RECORD_KEY = 'verification';

export class IntakeVerificationGuard {
  constructor(private state: StateLike) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const body = (await request.json()) as Record<string, unknown>;

    if (url.pathname === '/issue') {
      const codeHash = readString(body.codeHash);
      const ttlSeconds = Number(body.ttlSeconds);
      if (!codeHash || !Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
        return json({ error: 'codeHash and ttlSeconds are required' }, 400);
      }
      await this.issue(codeHash, ttlSeconds);
      return json({ ok: true });
    }

    if (url.pathname === '/confirm') {
      const codeHash = readString(body.codeHash);
      const maxAttempts = Number(body.maxAttempts);
      if (!codeHash || !Number.isFinite(maxAttempts) || maxAttempts <= 0) {
        return json({ error: 'codeHash and maxAttempts are required' }, 400);
      }
      return json(await this.confirm(codeHash, maxAttempts));
    }

    return json({ error: 'Not found' }, 404);
  }

  /** Expiry alarm: drop whatever is stored. Harmless if a newer code replaced it and is still live. */
  async alarm(): Promise<void> {
    const current = await this.state.storage.get<VerificationRecord>(RECORD_KEY);
    if (current && Date.parse(current.expiresAt) <= Date.now()) {
      await this.state.storage.delete(RECORD_KEY);
    }
  }

  /** Issue a fresh code, replacing any outstanding one. */
  async issue(codeHash: string, ttlSeconds: number): Promise<void> {
    const now = Date.now();
    const record: VerificationRecord = {
      codeHash,
      attempts: 0,
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttlSeconds * 1000).toISOString(),
    };
    await this.state.storage.put(RECORD_KEY, record);
    await this.state.storage.setAlarm?.(now + ttlSeconds * 1000 + 1000);
  }

  /**
   * Check a submitted code. A correct code is consumed immediately; a wrong one
   * burns an attempt, and the record is destroyed once the cap is hit so a
   * brute-force run has to request a fresh code (and pass the rate limiter).
   */
  async confirm(codeHash: string, maxAttempts: number): Promise<ConfirmResult> {
    const record = await this.state.storage.get<VerificationRecord>(RECORD_KEY);
    if (!record) return { ok: false, reason: 'expired' };

    if (Date.parse(record.expiresAt) <= Date.now()) {
      await this.state.storage.delete(RECORD_KEY);
      return { ok: false, reason: 'expired' };
    }

    if (timingSafeEqual(codeHash, record.codeHash)) {
      await this.state.storage.delete(RECORD_KEY);
      return { ok: true };
    }

    const attempts = record.attempts + 1;
    if (attempts >= maxAttempts) {
      await this.state.storage.delete(RECORD_KEY);
      return { ok: false, reason: 'attempts_exhausted' };
    }

    await this.state.storage.put(RECORD_KEY, { ...record, attempts });
    return { ok: false, reason: 'mismatch' };
  }
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
