import { Hono } from 'hono';
import type { Env } from './bindings';
import buildRoutes from './routes/build';

const app = new Hono<{ Bindings: Env }>();

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    worker: 'sesap-indexing',
    timestamp: new Date().toISOString(),
  });
});

// Mount build routes
app.route('/', buildRoutes);

export default app;
