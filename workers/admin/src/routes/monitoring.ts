import { Hono } from 'hono';
import type { Env } from '../bindings';
import type { ApiResponse, InterviewRecord, AuthenticatedUser } from '@sesap/types';
import { KV_KEYS } from '@sesap/types';
import { Logger } from '@sesap/shared';

const logger = new Logger({ worker: 'sesap-admin', module: 'monitoring-routes' });

type Variables = {
  user: AuthenticatedUser;
};

const monitoring = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/monitoring/stuck - interviews stuck in 'processing' > 10min
monitoring.get('/api/monitoring/stuck', async (c) => {
  const listRaw = await c.env.SESAP_KV.get(KV_KEYS.interviewsList);
  if (!listRaw) {
    const response: ApiResponse<InterviewRecord[]> = {
      success: true,
      data: [],
    };
    return c.json(response);
  }

  const ids: string[] = JSON.parse(listRaw);
  const stuck: InterviewRecord[] = [];
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

  for (const id of ids) {
    const raw = await c.env.SESAP_KV.get(KV_KEYS.interview(id));
    if (!raw) continue;

    const record: InterviewRecord = JSON.parse(raw);
    if (
      record.processing.status === 'processing' &&
      record.processing.startedAt &&
      new Date(record.processing.startedAt).getTime() < tenMinutesAgo
    ) {
      stuck.push(record);
    }
  }

  logger.info('Stuck interviews check', { count: stuck.length });

  const response: ApiResponse<InterviewRecord[]> = {
    success: true,
    data: stuck,
  };
  return c.json(response);
});

// GET /api/monitoring/failed - all failed interviews
monitoring.get('/api/monitoring/failed', async (c) => {
  const listRaw = await c.env.SESAP_KV.get(KV_KEYS.interviewsList);
  if (!listRaw) {
    const response: ApiResponse<InterviewRecord[]> = {
      success: true,
      data: [],
    };
    return c.json(response);
  }

  const ids: string[] = JSON.parse(listRaw);
  const failed: InterviewRecord[] = [];

  for (const id of ids) {
    const raw = await c.env.SESAP_KV.get(KV_KEYS.interview(id));
    if (!raw) continue;

    const record: InterviewRecord = JSON.parse(raw);
    if (record.processing.status === 'failed') {
      failed.push(record);
    }
  }

  logger.info('Failed interviews check', { count: failed.length });

  const response: ApiResponse<InterviewRecord[]> = {
    success: true,
    data: failed,
  };
  return c.json(response);
});

// GET /api/monitoring/stats - overall processing statistics
monitoring.get('/api/monitoring/stats', async (c) => {
  const listRaw = await c.env.SESAP_KV.get(KV_KEYS.interviewsList);
  if (!listRaw) {
    return c.json({
      success: true,
      data: {
        total: 0,
        pending: 0,
        queued: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      },
    });
  }

  const ids: string[] = JSON.parse(listRaw);
  const stats = {
    total: ids.length,
    pending: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  for (const id of ids) {
    const raw = await c.env.SESAP_KV.get(KV_KEYS.interview(id));
    if (!raw) continue;

    const record: InterviewRecord = JSON.parse(raw);
    const status = record.processing.status;

    if (status === 'pending') stats.pending++;
    else if (status === 'queued') stats.queued++;
    else if (status === 'processing') stats.processing++;
    else if (status === 'completed') stats.completed++;
    else if (status === 'failed') stats.failed++;
  }

  logger.info('Processing stats', stats);

  return c.json({
    success: true,
    data: stats,
  });
});

export default monitoring;
