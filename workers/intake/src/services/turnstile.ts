import { SesapError, ValidationError, isDevelopment } from '@sesap/core';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import { clientIp } from './rate-limit';

const logger = new Logger({ worker: 'sesap-intake', module: 'turnstile' });

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export class TurnstileConfigError extends SesapError {
  constructor() {
    super(
      'Turnstile is not configured: TURNSTILE_SECRET_KEY is required outside development',
      'TURNSTILE_NOT_CONFIGURED',
      503,
    );
    this.name = 'TurnstileConfigError';
  }
}

/**
 * Verify a Turnstile token before spending a send on someone.
 *
 * With no `TURNSTILE_SECRET_KEY` the check is skipped in development only.
 * Anywhere else a missing secret refuses the request: silently running without
 * bot protection is the failure this guards against.
 */
export async function verifyTurnstile(
  env: Env,
  request: Request,
  token: string | undefined,
): Promise<void> {
  if (!env.TURNSTILE_SECRET_KEY) {
    if (isDevelopment(env)) {
      logger.warn('Turnstile not configured; skipping challenge verification in development');
      return;
    }
    throw new TurnstileConfigError();
  }

  if (!token) {
    throw new ValidationError('Complete the challenge before requesting a code.');
  }

  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  body.append('remoteip', clientIp(request));

  const response = await fetch(VERIFY_URL, { method: 'POST', body });
  const result = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };

  if (!result.success) {
    logger.warn('Turnstile verification failed', { errors: result['error-codes'] });
    throw new ValidationError('Challenge verification failed. Please try again.');
  }
}
