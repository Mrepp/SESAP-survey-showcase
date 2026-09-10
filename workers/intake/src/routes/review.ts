import { Hono } from 'hono';
import { InterviewDraftSchema, ValidationError } from '@sesap/core';
import { R2_PATHS } from '@sesap/types';
import type {
  Analysis,
  ApiResponse,
  InterviewDraft,
  InterviewRecord,
  SubmitterView,
} from '@sesap/types';
import { Logger, applyInterviewDraft } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import { clientIp, enforceRateLimit } from '../services/rate-limit';
import { getInterview, putInterview } from '../services/interview';
import { invalidateReviewToken, resolveReviewToken } from '../services/review-token';

const logger = new Logger({ worker: 'sesap-intake', module: 'review-routes' });

export const review = new Hono<{ Bindings: Env }>();

/**
 * The review editor writes `analysis/<id>.json` and reads the transcript, so it
 * is rate-limited like the rest of the public surface. Applied to all three
 * routes, including the read, so a leaked link cannot be used to hammer R2.
 */
review.use('/api/intake/review/*', async (c, next) => {
  await enforceRateLimit(c.env, 'RL_REVIEW_IP', clientIp(c.req.raw));
  await next();
});

/**
 * The window in which a token holder may write.
 *
 * `submit` has always refused once the record moved on; the draft route did
 * not, so an admin reprocess (which sets `pending_review` without clearing the
 * token) left the submitter able to keep overwriting the analysis while it sat
 * in the admin queue. Checking it here also means a draft write can never touch
 * a published record, so there is no build to mark dirty from this worker.
 */
function assertDraftEditable(record: InterviewRecord): void {
  if (record.approval.status !== 'pending_submitter_review') {
    throw new ValidationError('This interview is no longer open for edits.');
  }
}

async function loadAnalysis(env: Env, id: string): Promise<Analysis | null> {
  const object = await env.SESAP_BUCKET.get(R2_PATHS.analysis(id));
  return object ? ((await object.json()) as Analysis) : null;
}

async function loadTranscript(env: Env, id: string): Promise<string> {
  const object = await env.SESAP_BUCKET.get(R2_PATHS.transcript(id));
  return object ? object.text() : '';
}

const load = (env: Env) => (id: string) => getInterview(env, id);

// GET /api/intake/review/:token — everything the submitter's editor needs.
review.get('/api/intake/review/:token', async (c) => {
  const record = await resolveReviewToken(c.env, c.req.param('token'), load(c.env));

  const data: SubmitterView = {
    id: record.id,
    title: record.title,
    demographics: record.demographics,
    metadata: record.metadata,
    transcript: await loadTranscript(c.env, record.id),
    analysis: await loadAnalysis(c.env, record.id),
    approvalStatus: record.approval.status,
    rejectionReason: record.approval.rejectionReason,
    revisionRound: record.submitterReview?.revisionRound ?? 0,
  };

  const response: ApiResponse<SubmitterView> = { success: true, data };
  return c.json(response);
});

// PUT /api/intake/review/:token/draft — the same InterviewDraft shape and the
// same `applyInterviewDraft` the admin editor uses, so one validator and one
// id-minting rule serve both.
review.put('/api/intake/review/:token/draft', async (c) => {
  const record = await resolveReviewToken(c.env, c.req.param('token'), load(c.env));
  assertDraftEditable(record);

  const parsed = InterviewDraftSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    throw new ValidationError('Invalid draft data', parsed.error.flatten());
  }
  const draft = parsed.data as InterviewDraft;

  // Re-read immediately before writing, and apply the draft to *that* record.
  //
  // `putInterview` writes the whole record back with no compare-and-set, so
  // applying the draft to the copy read at the top of the request would let a
  // slow submitter restore a stale record over a concurrent admin approval —
  // reverting the status, wiping `adminConfirmed`, and reinstating the token
  // that had just been burned. Re-checking the guard against the fresh record
  // is what makes that race lose: once an admin has approved, this refuses.
  const fresh = await getInterview(c.env, record.id);
  assertDraftEditable(fresh);
  if (fresh.submitterReview?.tokenHash !== record.submitterReview?.tokenHash) {
    throw new ValidationError('This review link is no longer valid.');
  }

  const { analysis: savedAnalysis } = await applyInterviewDraft(c.env.SESAP_BUCKET, fresh, draft);
  await putInterview(c.env, fresh);

  const response: ApiResponse<{ analysis?: Analysis }> = {
    success: true,
    data: { analysis: savedAnalysis },
  };
  return c.json(response);
});

// POST /api/intake/review/:token/submit — hands the interview to admin review
// and burns the token.
review.post('/api/intake/review/:token/submit', async (c) => {
  const record = await resolveReviewToken(c.env, c.req.param('token'), load(c.env));

  if (record.processing.status !== 'completed') {
    throw new ValidationError('Your interview is still being processed. Try again shortly.');
  }
  if (record.approval.status !== 'pending_submitter_review') {
    // The link resolved, so it is this submitter's — but the record has moved
    // on (an admin approved or reprocessed it). Nothing to hand over.
    throw new ValidationError('This interview is no longer waiting on your review.');
  }

  const now = new Date().toISOString();
  record.approval.status = 'pending_review';
  record.approval.rejectionReason = undefined;
  record.submitterReview = {
    ...(record.submitterReview ?? { revisionRound: 0 }),
    submittedAt: now,
  };
  await putInterview(c.env, record);

  const tokenHash = record.submitterReview.tokenHash;
  if (tokenHash) await invalidateReviewToken(c.env, tokenHash);

  logger.info('Submitter handed interview to admin review', { interviewId: record.id });

  const response: ApiResponse<{ interviewId: string }> = {
    success: true,
    data: { interviewId: record.id },
  };
  return c.json(response);
});
