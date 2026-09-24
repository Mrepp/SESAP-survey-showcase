import { Hono } from 'hono';
import type { Env } from '../bindings';
import type { ApiResponse, InterviewRecord, AuthenticatedUser } from '@sesap/types';
import { Logger, listInterviewRecords } from '@sesap/worker-runtime';

const logger = new Logger({ worker: 'sesap-admin', module: 'monitoring-routes' });

type Variables = {
  user: AuthenticatedUser;
};

const monitoring = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/monitoring/stuck - interviews stuck in 'processing' > 10min
monitoring.get('/api/monitoring/stuck', async (c) => {
  const records = await listInterviewRecords(c.env.SESAP_KV);
  const stuck: InterviewRecord[] = [];
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

  for (const record of records) {
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
  const records = await listInterviewRecords(c.env.SESAP_KV);
  const failed: InterviewRecord[] = [];

  for (const record of records) {
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
  const records = await listInterviewRecords(c.env.SESAP_KV);
  const stats = {
    total: records.length,
    pending: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  for (const record of records) {
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
