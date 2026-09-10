import { Hono } from 'hono';
import type { Env } from '../bindings';
import type { AuthenticatedUser } from '@sesap/types';

type Variables = {
  user: AuthenticatedUser;
};

const health = new Hono<{ Bindings: Env; Variables: Variables }>();

health.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    worker: 'sesap-admin',
    timestamp: new Date().toISOString(),
  });
});

// `GET /api/debug/headers` used to live here, echoing the caller's `cf-*`
// headers. This router is mounted before the auth middleware so that health
// checks work without an Access session, which made the debug endpoint public
// too. It only ever reflected the caller's own headers, so the exposure was
// small — but a public endpoint that reports Access header state on the admin
// origin has no reason to exist. Removed rather than moved behind auth: an
// administrator who needs it can read the same headers from the browser.

export { health };
