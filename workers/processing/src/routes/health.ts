import { Hono } from 'hono';
import type { Env } from '../bindings';

const healthRoutes = new Hono<{ Bindings: Env }>();

healthRoutes.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    worker: 'sesap-processing',
    timestamp: new Date().toISOString(),
  });
});

export { healthRoutes };
