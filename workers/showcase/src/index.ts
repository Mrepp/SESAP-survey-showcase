import { Hono } from 'hono';
import type { Env } from './bindings';
import { health } from './routes/health';
import { assets } from './routes/assets';

const app = new Hono<{ Bindings: Env }>();

// Mount routes
app.route('/', health);
app.route('/', assets);


export default app;
