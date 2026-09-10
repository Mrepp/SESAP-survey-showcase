import { Hono } from 'hono';
import { ValidationError } from '@sesap/core';
import type { ApiResponse, IntakeSession } from '@sesap/types';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import { clientIp, enforceRateLimit } from '../services/rate-limit';
import { sendEmail } from '../services/mailer';
import { verificationCodeEmail } from '../services/templates';
import { createSession, loadSessionFromRequest } from '../services/session';
import { verifyTurnstile } from '../services/turnstile';
import {
  CODE_TTL_SECONDS,
  assertAllowedEmail,
  confirmVerificationCode,
  issueVerificationCode,
  normalizeEmail,
} from '../services/verification';

const logger = new Logger({ worker: 'sesap-intake', module: 'verify-routes' });

export const verify = new Hono<{ Bindings: Env }>();

/**
 * Sending mail costs money and reputation, so the door is guarded twice: a
 * Turnstile challenge, then per-address and per-IP rate limits. The code
 * itself is attempt-capped by the per-address Durable Object.
 */
verify.post('/api/intake/verify/start', async (c) => {
  const body = await c.req.json<{ email?: unknown; turnstileToken?: unknown }>();
  if (typeof body.email !== 'string') {
    throw new ValidationError('An email address is required.');
  }

  const email = assertAllowedEmail(body.email);

  await verifyTurnstile(
    c.env,
    c.req.raw,
    typeof body.turnstileToken === 'string' ? body.turnstileToken : undefined,
  );

  await enforceRateLimit(c.env, 'RL_VERIFY_EMAIL', email);
  await enforceRateLimit(c.env, 'RL_VERIFY_IP', clientIp(c.req.raw));

  const code = await issueVerificationCode(c.env, email);
  await sendEmail(c.env, verificationCodeEmail(email, code, CODE_TTL_SECONDS / 60));

  const response: ApiResponse<{ email: string; expiresInSeconds: number }> = {
    success: true,
    data: { email, expiresInSeconds: CODE_TTL_SECONDS },
  };
  return c.json(response);
});

verify.post('/api/intake/verify/confirm', async (c) => {
  const body = await c.req.json<{ email?: unknown; code?: unknown }>();
  if (typeof body.email !== 'string' || typeof body.code !== 'string') {
    throw new ValidationError('Email and code are required.');
  }

  const email = normalizeEmail(body.email);
  // Both keys. Per-IP alone leaves a single mailbox open to a distributed run:
  // `IntakeVerificationGuard.issue` resets the attempt counter on every new
  // code, so three issuances a minute buy fifteen guesses a minute against a
  // 10^6 keyspace with no lockout, and spreading the guesses across IPs makes
  // the per-IP rule irrelevant. The per-address rule is the one that binds.
  await enforceRateLimit(c.env, 'RL_CONFIRM_EMAIL', email);
  await enforceRateLimit(c.env, 'RL_CONFIRM_IP', clientIp(c.req.raw));

  const result = await confirmVerificationCode(c.env, email, body.code);
  if (!result.ok) {
    // Deliberately uniform wording: distinguishing "expired" from "wrong" tells
    // an attacker whether an address has a code outstanding.
    throw new ValidationError('That code is not valid. Request a new one.');
  }

  const { cookie } = await createSession(c.env, { email, verifiedAt: new Date().toISOString() });
  logger.info('Email verified');

  c.header('Set-Cookie', cookie);
  const response: ApiResponse<{ email: string }> = { success: true, data: { email } };
  return c.json(response);
});

/** Lets a resumed browser session pick up where it left off. */
verify.get('/api/intake/session', async (c) => {
  const loaded = await loadSessionFromRequest(c.env, c.req.header('Cookie'));
  const response: ApiResponse<{ session: IntakeSession | null }> = {
    success: true,
    data: { session: loaded?.session ?? null },
  };
  return c.json(response);
});
