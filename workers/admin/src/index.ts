import { Hono } from 'hono';
import type { Env } from './bindings';
import type { AuthenticatedUser } from '@sesap/types';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { health } from './routes/health';
import { interviews } from './routes/interviews';
import auth from './routes/auth';
import retry from './routes/retry';
import monitoring from './routes/monitoring';
import { staticAssets } from './routes/static';

type Variables = {
  user: AuthenticatedUser;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Error handler
app.onError(errorHandler);

// Health check (no auth required)
app.route('', health);

// Auth middleware for API and admin UI
app.use('/api/*', authMiddleware);
app.use('/*', authMiddleware);

// Auth routes
app.route('/api/auth', auth);

// Interview API routes
app.route('', interviews);

// Retry and monitoring routes
app.route('', retry);
app.route('', monitoring);

// Admin UI — Next.js static export served by ASSETS binding (prod) or proxied
// to `next dev` (local). Mount last so /api/* routes take precedence.
app.route('', staticAssets);

export default app;
