import { Hono } from 'hono';
import { parseDeployEnv } from '@sesap/core';
import type { Env } from '../bindings';

export const health = new Hono<{ Bindings: Env }>();

health.get('/api/health', (c) =>
  c.json({
    status: 'ok',
    worker: 'sesap-intake',
    environment: parseDeployEnv(c.env) ?? 'unknown',
    timestamp: new Date().toISOString(),
  }),
);
