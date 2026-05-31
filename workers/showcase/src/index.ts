import { Hono } from 'hono';
import type { Env } from './bindings';
import { health } from './routes/health';
import { assets } from './routes/assets';
import { search } from './routes/search';
import { staticAssets } from './routes/static';

const app = new Hono<{ Bindings: Env }>();

// Mount routes
app.route('/', health);
app.route('/', assets);
app.route('/', search);
app.route('/', staticAssets);


export default app;
