import { Hono } from 'hono';
import type { Env } from '../bindings';

const assets = new Hono<{ Bindings: Env }>();

// Proxy R2 build artifacts with cache headers
assets.get('/assets/build/*', async (c) => {
  const url = new URL(c.req.url);
  const path = c.req.path.replace('/assets/build/', '');
  const object = await c.env.SESAP_BUCKET.get(`build/${path}`);

  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  const isMetadata = path === 'metadata.json';
  const version = url.searchParams.get('v');

  if (isMetadata) {
    headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
  } else if (version) {
    headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
  } else {
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600');
  }

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
