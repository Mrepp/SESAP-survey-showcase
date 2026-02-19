import { Hono } from 'hono';
import type { Env } from '../bindings';
import { KV_KEYS } from '@sesap/types';
import { Logger, ValidationError } from '@sesap/shared';
import type { ApiResponse, InterviewRecord } from '@sesap/types';
import { processInterview } from '../services/process-interview';

const logger = new Logger({ service: 'process-route' });

const processRoutes = new Hono<{ Bindings: Env }>();

// HTTP endpoint for local dev (wrangler doesn't simulate queues) and retries
processRoutes.post('/api/process', async (c) => {
  const body = await c.req.json<{ interviewId?: string }>();
  const { interviewId } = body;

  if (!interviewId) {
    throw new ValidationError('interviewId is required');
  }

  const log = logger.child({ interviewId });
  log.info('Processing via HTTP endpoint', { interviewId });

  try {
    // Call the same processing function used by the queue consumer
    await processInterview(c.env, {
      interviewId,
      queuedAt: new Date().toISOString(),
      metadata: {
        triggeredBy: 'http',
        reason: 'retry_auto',
      },
    });

    const response: ApiResponse<{ interviewId: string; status: string }> = {
      success: true,
      data: { interviewId, status: 'completed' },
    };
    return c.json(response);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log.error('Processing failed', { error: errorMessage });

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'PROCESSING_FAILED',
        message: errorMessage,
      },
    };
    return c.json(response, 500);
  }
});

// GET /api/process/:id/status - get processing status
processRoutes.get('/api/process/:id/status', async (c) => {
  const id = c.req.param('id');
  const raw = await c.env.SESAP_KV.get(KV_KEYS.interview(id));

  if (!raw) {
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'NOT_FOUND', message: `Interview not found: ${id}` },
    };
    return c.json(response, 404);
  }

  const record: InterviewRecord = JSON.parse(raw);
  const response: ApiResponse<InterviewRecord['processing']> = {
    success: true,
    data: record.processing,
  };
  return c.json(response);
});

export { processRoutes };
