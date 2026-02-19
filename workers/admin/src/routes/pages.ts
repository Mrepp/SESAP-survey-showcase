import { Hono } from 'hono';
import type { Env } from '../bindings';
import type { AuthenticatedUser } from '@sesap/types';
import { Logger } from '@sesap/shared';

type Variables = {
  user: AuthenticatedUser;
};

const logger = new Logger({ worker: 'sesap-admin', module: 'pages' });

const pages = new Hono<{ Bindings: Env; Variables: Variables }>();

// SPA fallback: all page routes serve the React app's index.html.
// Wrangler's asset handler serves the actual static files (JS, CSS) at /assets/*.
// This catch-all ensures client-side routing works for /, /upload, /interview/:id
pages.get('*', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/index.html';
  const assetUrl = url.toString();

  try {
    // Try fetching with just the URL string (simplest form for ASSETS binding)
    const response = await c.env.ASSETS.fetch(assetUrl);
    if (response.ok) return response;
  } catch (err) {
    logger.warn('ASSETS.fetch with URL string failed', {
      assetUrl,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Fallback: construct a new GET request explicitly
  try {
    const response = await c.env.ASSETS.fetch(
      new Request(assetUrl, { method: 'GET' }),
    );
    if (response.ok) return response;
  } catch (err) {
    logger.warn('ASSETS.fetch with new Request failed', {
      assetUrl,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Last resort: serve a minimal SPA shell that loads the app at the current URL
  logger.error('All ASSETS.fetch attempts failed for admin index.html', {
    path: c.req.path,
  });
  return c.html(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SESAP Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
  <script type="module" crossorigin src="/assets/index.js"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
  );
});

export { pages };
