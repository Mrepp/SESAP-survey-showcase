import { SesapError, isDevelopment } from '@sesap/core';
import { Logger } from '@sesap/worker-runtime';
import type { Env, RateLimitBinding } from '../bindings';

const logger = new Logger({ worker: 'sesap-intake', module: 'rate-limit' });

export class RateLimitError extends SesapError {
  constructor(retryAfterSeconds: number) {
    super(
      `Too many attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
      'RATE_LIMITED',
      429,
      { retryAfterSeconds },
    );
    this.name = 'RateLimitError';
  }
}

export class RateLimitConfigError extends SesapError {
  constructor(name: string) {
    super(
      `Rate limiting is not configured: the ${name} binding is missing`,
      'RATE_LIMIT_NOT_CONFIGURED',
      503,
      { binding: name },
    );
    this.name = 'RateLimitConfigError';
  }
}

/**
 * The rules, as declared in wrangler.example.toml. The platform binding counts
 * per 60-second window (its longest), so the numbers are per minute; the
 * limit and period themselves live in the config, not here.
 */
export const RATE_LIMITS = {
  RL_VERIFY_EMAIL: { description: 'verification mails per address', windowSeconds: 60 },
  RL_VERIFY_IP: { description: 'verification mails per IP', windowSeconds: 60 },
  RL_CONFIRM_IP: { description: 'code guesses per IP', windowSeconds: 60 },
} as const;

export type RateLimitName = keyof typeof RATE_LIMITS;

/**
 * Enforce one rule through Cloudflare's Rate Limiting binding.
 *
 * The binding is counted at the edge by the platform, so unlike the KV counter
 * it replaced, guesses spread across colos cannot slip past it. A missing
 * binding is skipped only in development (unit tests, a bare `wrangler dev`);
 * anywhere else it refuses the request, in line with every other dev-only gap.
 */
export async function enforceRateLimit(env: Env, name: RateLimitName, key: string): Promise<void> {
  const binding: RateLimitBinding | undefined = env[name];
  if (!binding) {
    if (isDevelopment(env)) {
      logger.warn('Rate limit binding missing; skipping in development', { binding: name });
      return;
    }
    throw new RateLimitConfigError(name);
  }

  const { success } = await binding.limit({ key });
  if (!success) {
    throw new RateLimitError(RATE_LIMITS[name].windowSeconds);
  }
}

/** Client IP as Cloudflare reports it; `unknown` keeps the key well-formed locally. */
export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}
