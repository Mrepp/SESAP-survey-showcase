import { Hono } from 'hono';
import { InterviewDraftSchema, ValidationError } from '@sesap/core';
import { R2_PATHS } from '@sesap/types';
import type { Analysis, ApiResponse, InterviewDraft, SubmitterView } from '@sesap/types';
import { Logger, applyInterviewDraft } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import { getInterview, putInterview } from '../services/interview';
import { invalidateReviewToken, resolveReviewToken } from '../services/review-token';

const logger = new Logger({ worker: 'sesap-intake', module: 'review-routes' });

export const review = new Hono<{ Bindings: Env }>();

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

  const parsed = InterviewDraftSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    throw new ValidationError('Invalid draft data', parsed.error.flatten());
  }
  const draft = parsed.data as InterviewDraft;

  const { analysis: savedAnalysis } = await applyInterviewDraft(c.env.SESAP_BUCKET, record, draft);
  await putInterview(c.env, record);

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
