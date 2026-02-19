import { Hono } from 'hono';
import type { Env } from '../bindings';

const health = new Hono<{ Bindings: Env }>();

health.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    worker: 'sesap-showcase',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});

export { health };
