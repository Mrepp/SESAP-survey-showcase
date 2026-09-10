import { Hono } from 'hono';
import type { ApiResponse } from '@sesap/types';
import type { Env } from '../bindings';

export const config = new Hono<{ Bindings: Env }>();

/**
 * Public, build-independent configuration for the wizard.
 *
 * The UI is a Next.js static export served from the ASSETS binding, so a
 * `NEXT_PUBLIC_*` value would be baked in at build time and one artifact could
 * not serve two environments. The Turnstile site key is public by design — it
 * is rendered into the widget — so handing it over at runtime costs nothing and
 * keeps the deployed bundle identical across staging and production.
 *
 * An empty `turnstileSiteKey` means no widget is rendered. That is only a
 * working configuration in development: outside it, `services/turnstile.ts`
 * refuses a request with no secret, and refuses a request with no token.
 */
config.get('/api/intake/config', (c) => {
  const response: ApiResponse<{ turnstileSiteKey: string }> = {
    success: true,
    data: { turnstileSiteKey: c.env.TURNSTILE_SITE_KEY ?? '' },
  };
  return c.json(response);
});
