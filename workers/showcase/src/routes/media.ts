import { Hono } from 'hono';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { BuildMetadata } from '@sesap/types';
import type { Env } from '../bindings';

const media = new Hono<{ Bindings: Env }>();

const CONTENT_TYPES: Record<string, string> = {
  webm: 'video/webm',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
};

async function isPublished(env: Env, id: string): Promise<boolean> {
  const raw = await env.SESAP_KV.get(KV_KEYS.buildManifest);
  if (!raw) return false;

  const manifest = JSON.parse(raw) as BuildMetadata;
  return Array.isArray(manifest.interviewIds) && manifest.interviewIds.includes(id);
}

// Stream self-service media only after its interview appears in the published
// manifest. R2 handles the requested byte range so browsers can seek.
media.get('/media/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return c.notFound();
  if (!(await isPublished(c.env, id))) {
    return c.notFound();
  }

  const listed = await c.env.SESAP_BUCKET.list({ prefix: R2_PATHS.mediaPrefix(id) });
  const target = listed.objects[0];
  if (!target) return c.notFound();

  const object = await c.env.SESAP_BUCKET.get(
    target.key,
    c.req.header('Range') ? { range: c.req.raw.headers } : undefined,
  );
  if (!object) return c.notFound();

  const ext = target.key.split('.').pop()?.toLowerCase() ?? '';
  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType ?? CONTENT_TYPES[ext] ?? 'application/octet-stream');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  if (object.range) {
    const total = object.size;
    const length = 'suffix' in object.range
      ? Math.min(object.range.suffix, total)
      : (object.range.length ?? total - (object.range.offset ?? 0));
    const offset = 'suffix' in object.range ? total - length : (object.range.offset ?? 0);
    headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${total}`);
    headers.set('Content-Length', String(length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set('Content-Length', String(object.size));
  return new Response(object.body, { headers });
});

export { media };
