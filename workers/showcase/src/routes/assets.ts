import { Hono } from 'hono';
import type { Env } from '../bindings';

const assets = new Hono<{ Bindings: Env }>();

// Proxy R2 build artifacts with cache headers
assets.get('/assets/build/*', async (c) => {
  const path = c.req.path.replace('/assets/build/', '');
  const object = await c.env.SESAP_BUCKET.get(`build/${path}`);

  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=3600');

  const ext = path.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    json: 'application/json',
    html: 'text/html',
    js: 'application/javascript',
    css: 'text/css',
    txt: 'text/plain',
  };
  headers.set('Content-Type', contentTypes[ext ?? ''] ?? 'application/octet-stream');

  return new Response(object.body, { headers });
});

export { assets };
