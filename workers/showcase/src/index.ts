import { Hono } from 'hono';
import type { Env } from './bindings';
import { health } from './routes/health';
import { assets } from './routes/assets';

const app = new Hono<{ Bindings: Env }>();

// Mount routes
app.route('/', health);
app.route('/', assets);

// SPA fallback: serve index.html for unmatched routes via ASSETS binding
app.get('*', async (c) => {
  // Try to serve the exact path first (e.g. /assets/index-xxx.js)
  const response = await c.env.ASSETS.fetch(new Request(c.req.url));
  if (response.ok) return response;

  // Fall back to index.html for SPA routing
  const url = new URL(c.req.url);
  url.pathname = '/index.html';
  return c.env.ASSETS.fetch(new Request(url.toString()));
});

export default app;
