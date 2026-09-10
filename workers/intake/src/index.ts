import { Hono } from 'hono';
import type { NotificationMessage } from '@sesap/types';
import { createErrorHandler, Logger } from '@sesap/worker-runtime';
import type { Env } from './bindings';
import { health } from './routes/health';
import { config } from './routes/config';
import { verify } from './routes/verify';
import { sessionRoutes } from './routes/session';
import { upload } from './routes/upload';
import { review } from './routes/review';
import { staticAssets } from './routes/static';
import { handleNotification } from './services/notifications';
export { IntakeVerificationGuard } from './durable/verification-guard';

const logger = new Logger({ worker: 'sesap-intake', module: 'index' });

const app = new Hono<{ Bindings: Env }>();

app.onError(createErrorHandler<{ Bindings: Env }>({ worker: 'sesap-intake' }));

app.route('', health);
app.route('', config);
app.route('', verify);
app.route('', sessionRoutes);
app.route('', upload);
app.route('', review);

// Static export catch-all, mounted last so /api/* wins.
app.route('', staticAssets);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return app.fetch(request, env);
  },

  /**
   * Consumer for `interview-notifications`. Processing and admin produce onto
   * it; intake is the only consumer and the only worker that sends mail, which
   * is what keeps the worker dependency graph acyclic.
   */
  async queue(batch: MessageBatch<NotificationMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        await handleNotification(env, message.body);
        message.ack();
      } catch (error) {
        logger.error('Notification failed', {
          interviewId: message.body?.interviewId,
          kind: message.body?.kind,
          error: error instanceof Error ? error.message : String(error),
        });
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<Env, NotificationMessage>;
