import { Hono } from 'hono';
import type { Env } from './bindings';
import type { ProcessingQueueMessage } from '@sesap/types';
import { errorHandler } from './middleware/error-handler';
import { healthRoutes } from './routes/health';
import { processRoutes } from './routes/process';
import { processInterview } from './services/process-interview';
import { Logger } from '@sesap/shared';

const logger = new Logger({ worker: 'sesap-processing', module: 'index' });

const app = new Hono<{ Bindings: Env }>();

// Error handler
app.onError(errorHandler);

// Routes
app.route('', healthRoutes);
app.route('', processRoutes);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Keep health check and status endpoints
    return app.fetch(request, env);
  },

  // Queue consumer
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const body = message.body as ProcessingQueueMessage;
      try {
        await processInterview(env, body);
        message.ack();
      } catch (err) {
        logger.error('Processing failed', {
          interviewId: body.interviewId,
          error: err instanceof Error ? err.message : String(err),
          retries: message.attempts,
        });
        message.retry();  // Queue handles backoff
      }
    }
  },
} satisfies ExportedHandler<Env>;
