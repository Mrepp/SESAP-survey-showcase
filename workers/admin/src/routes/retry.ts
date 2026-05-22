import { Hono } from 'hono';
import type { Env } from '../bindings';
import type { ApiResponse, InterviewRecord, AuthenticatedUser } from '@sesap/types';
import { KV_KEYS } from '@sesap/types';
import { ValidationError, Logger } from '@sesap/shared';
import * as interviewService from '../services/interview-service';

const logger = new Logger({ worker: 'sesap-admin', module: 'retry-routes' });

type Variables = {
  user: AuthenticatedUser;
};

const retry = new Hono<{ Bindings: Env; Variables: Variables }>();

retry.post('/api/interviews/:id/retry', async (c) => {
  const id = c.req.param('id');
  const record = await interviewService.getInterview(c.env, id);

  // Only allow retry if failed or stuck in processing
  if (!['failed', 'processing'].includes(record.processing.status)) {
    throw new ValidationError(
      `Interview is not in a retriable state. Current status: ${record.processing.status}`,
    );
  }

  logger.info('Manual retry requested', {
    id,
    currentStatus: record.processing.status,
    retryCount: record.processing.retryCount || 0,
  });

  // Re-queue with manual retry metadata
  await c.env.PROCESSING_QUEUE.send({
    interviewId: id,
    queuedAt: new Date().toISOString(),
    metadata: {
      triggeredBy: c.get('user')?.email || 'admin',
      reason: 'retry_admin',
    },
  });

  // Update status to 'queued'
  record.processing.status = 'queued';
  record.processing.queuedAt = new Date().toISOString();
  record.processing.error = undefined;  // Clear previous error
  record.updatedAt = new Date().toISOString();
  await c.env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  logger.info('Interview re-queued for processing', { id });

  const response: ApiResponse<InterviewRecord> = {
    success: true,
    data: record,
  };
  return c.json(response);
});

export default retry;