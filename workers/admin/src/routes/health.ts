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

// Debug endpoint to check Cloudflare Access headers
health.get('/api/debug/headers', (c) => {
  const allCfHeaders: Record<string, string> = {};

  c.req.raw.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith('cf-')) {
      allCfHeaders[key] = value;
    }
  });

  const headers = {
    email: c.req.header('Cf-Access-Authenticated-User-Email'),
    username: c.req.header('Cf-Access-Authenticated-User-Login'),
    allCfHeaders,
  };

  return c.json({
    status: 'debug',
    headers,
    timestamp: new Date().toISOString(),
  });
});

export { health };
