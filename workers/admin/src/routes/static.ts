import { Hono } from 'hono';
import type { Env } from '../bindings';
import type { AuthenticatedUser } from '@sesap/types';

type Variables = {
  user: AuthenticatedUser;
};

const staticAssets = new Hono<{ Bindings: Env; Variables: Variables }>();

// Catch-all: serve the static next export from the ASSETS binding in prod,
// or proxy to a running `next dev` server in local development. Keeping this
// in the worker (rather than relying on Cloudflare's asset routing) lets dev
// match prod — auth middleware still runs first via run_worker_first.
staticAssets.all('*', async (c) => {
  const devUrl = c.env.NEXT_DEV_URL;

  // The dev proxy is only meaningful when running locally — CF Workers cannot
  // reach 127.0.0.1 from the edge. Gate on ENVIRONMENT so a stale NEXT_DEV_URL
  // in the prod toml doesn't break asset serving.
  if (devUrl && c.env.ENVIRONMENT !== 'production') {
    const url = new URL(c.req.url);
    const target = new URL(url.pathname + url.search, devUrl);
    const proxied = new Request(target.toString(), c.req.raw);
    return fetch(proxied);
  }

  return c.env.ASSETS.fetch(c.req.raw);
});

export { staticAssets };
