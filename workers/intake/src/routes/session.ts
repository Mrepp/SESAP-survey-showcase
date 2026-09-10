import { Hono } from 'hono';
import { CONSENT_VERSION, DemographicsSchema, ValidationError } from '@sesap/core';
import type { ApiResponse, AttributionChoice, IntakeSession } from '@sesap/types';
import type { Env } from '../bindings';
import {
  clearSessionCookie,
  deleteSession,
  loadSessionFromRequest,
  putSession,
  requireSession,
} from '../services/session';

export const sessionRoutes = new Hono<{ Bindings: Env }>();

const MAX_NAME_LENGTH = 120;

function requiredString(value: unknown, field: string, max = MAX_NAME_LENGTH): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`${field} is required.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new ValidationError(`${field} must be ${max} characters or fewer.`);
  }
  return trimmed;
}

// POST /api/intake/session/profile — name, major, graduation year, optional
// self-reported demographics.
sessionRoutes.post('/api/intake/session/profile', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  const body = await c.req.json<Record<string, unknown>>();

  const name = requiredString(body.name, 'Name');
  const major = requiredString(body.major, 'Major');
  const graduationYear = requiredString(body.graduationYear, 'Graduation year', 8);

  if (!/^\d{4}$/.test(graduationYear)) {
    throw new ValidationError('Graduation year must be a four-digit year.');
  }

  let demographics: IntakeSession['demographics'];
  if (body.demographics !== undefined) {
    const parsed = DemographicsSchema.safeParse(body.demographics);
    if (!parsed.success) {
      throw new ValidationError('Invalid demographics', parsed.error.flatten());
    }
    demographics = parsed.data;
  }

  const updated: IntakeSession = {
    ...session,
    name,
    major,
    graduationYear,
    demographics: { ...demographics, major, graduationYear },
  };
  await putSession(c.env, sessionId, updated);

  const response: ApiResponse<IntakeSession> = { success: true, data: updated };
  return c.json(response);
});

// POST /api/intake/session/consent — records the agreement and the attribution
// choice. The archived R2 record is written later, when the interview id exists.
sessionRoutes.post('/api/intake/session/consent', async (c) => {
  const { sessionId, session } = requireSession(
    await loadSessionFromRequest(c.env, c.req.header('Cookie')),
  );
  const body = await c.req.json<{ agreed?: unknown; attribution?: unknown }>();

  if (body.agreed !== true) {
    throw new ValidationError('You must agree to the consent and release to continue.');
  }

  // Attribution is an affirmative choice with no default — an unset value is a
  // validation error rather than a silent fallback to anonymous or named.
  if (body.attribution !== 'named' && body.attribution !== 'anonymous') {
    throw new ValidationError('Choose whether to be credited by name or to publish anonymously.');
  }
  const attribution = body.attribution as AttributionChoice;

  if (attribution === 'named' && !session.name) {
    throw new ValidationError('Add your name on the previous step before choosing attribution.');
  }

  const updated: IntakeSession = {
    ...session,
    consent: {
      consentVersion: CONSENT_VERSION,
      attribution,
      agreedAt: new Date().toISOString(),
    },
  };
  await putSession(c.env, sessionId, updated);

  const response: ApiResponse<IntakeSession> = { success: true, data: updated };
  return c.json(response);
});

// POST /api/intake/session/logout — drop the server-side session and expire the
// cookie. A shared or public machine needs a way to end the session that does
// not depend on the 24-hour TTL running out.
sessionRoutes.post('/api/intake/session/logout', async (c) => {
  const loaded = await loadSessionFromRequest(c.env, c.req.header('Cookie'));
  if (loaded) {
    await deleteSession(c.env, loaded.sessionId);
  }

  // Unconditional: an unknown or already-expired cookie still gets cleared, and
  // the answer does not distinguish the two.
  c.header('Set-Cookie', clearSessionCookie());
  const response: ApiResponse<{ loggedOut: true }> = { success: true, data: { loggedOut: true } };
  return c.json(response);
});
