import type { MiddlewareHandler } from 'hono';
import { Logger } from '@sesap/shared';
import type { Env } from '../bindings';

const logger = new Logger({ worker: 'sesap-processing', module: 'require-internal' });

const SECRET_HEADER = 'X-Sesap-Processing-Secret';

/**
 * `ENVIRONMENT` is the only signal this worker has. Kept local rather than
 * imported: processing depends on `@sesap/shared`, which does not export an
 * environment helper, and `@sesap/core` is not a dependency of this worker.
 */
export function isDevelopmentEnv(env: Env): boolean {
  return env.ENVIRONMENT === 'development';
}

/** Length-independent equality; both sides here are fixed-length secrets. */
function constantTimeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  // Compare a fixed number of bytes so the loop count does not leak the length.
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < length; i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

/**
 * Require the shared secret on the processing HTTP surface.
 *
 * These routes were mounted with no auth at all: `POST /api/process` would
 * spend AI budget on any id, and `GET /api/process/:id/status` returned the
 * whole `processing` object — `processing.error` included, which carries
 * model-influenced text — for any id. The queue consumer is unaffected; it
 * never goes through the router.
 *
 * A missing secret refuses the request outside development rather than failing
 * open, matching how the intake worker treats a missing rate-limit binding.
 */
export const requireInternalSecret: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (isDevelopmentEnv(c.env)) {
    await next();
    return;
  }

  if (!c.env.PROCESSING_SHARED_SECRET) {
    logger.error('PROCESSING_SHARED_SECRET is not configured; refusing the request');
    return c.json(
      {
        success: false,
        error: {
          code: 'PROCESSING_AUTH_NOT_CONFIGURED',
          message: 'Processing is not configured to accept HTTP requests.',
        },
      },
      503,
    );
  }

  const presented = c.req.header(SECRET_HEADER);
  if (!presented || !constantTimeEqual(presented, c.env.PROCESSING_SHARED_SECRET)) {
    logger.warn('Rejected an unauthenticated processing request', { path: c.req.path });
    return c.json(
      { success: false, error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
      401,
    );
  }

  await next();
};
