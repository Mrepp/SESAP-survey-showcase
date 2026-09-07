import { Hono } from 'hono';
import { isDevelopment } from '@sesap/core';
import type { Env } from '../bindings';

const staticAssets = new Hono<{ Bindings: Env }>();

// Catch-all: serve the static next export from the ASSETS binding in prod, or
// proxy to a running `next dev` server in local development. Mounted last so
// every /api/* route takes precedence.
/**
 * Review links are `/review/<token>`. A static export cannot pre-render one
 * page per token — and tokens must never appear in a build artifact — so every
 * such path is served the single `/review/` page, which reads the token from
 * `location.pathname`.
 */
function rewriteReviewPath(url: URL): URL {
  if (/^\/review\/[^/]+\/?$/.test(url.pathname)) {
    const rewritten = new URL(url);
    rewritten.pathname = '/review/';
    return rewritten;
  }
  return url;
}

staticAssets.all('*', async (c) => {
  const devUrl = c.env.NEXT_DEV_URL;

  // The dev proxy is only meaningful when running locally — CF Workers cannot
  // reach 127.0.0.1 from the edge (returns CF error 1003). Gate on ENVIRONMENT
  // so a stale NEXT_DEV_URL in a deployed config doesn't break asset serving.
  // Staging serves built assets exactly as production does.
  const url = rewriteReviewPath(new URL(c.req.url));

  if (devUrl && isDevelopment(c.env)) {
    const target = new URL(url.pathname + url.search, devUrl);
    return fetch(new Request(target.toString(), c.req.raw));
  }

  return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
});

export { staticAssets };
