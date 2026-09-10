import type { NotificationMessage } from '@sesap/types';

export interface Env {
  AI: Ai;
  AI_NEURON_LIMITER: DurableObjectNamespace;
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;
  ENVIRONMENT: string;
  NOTIFICATION_QUEUE?: Queue<NotificationMessage>;
  /**
   * Shared secret for the HTTP surface (`X-Sesap-Processing-Secret`). Required
   * outside development; a deploy without it refuses HTTP requests rather than
   * serving them unauthenticated. The queue consumer does not use it — queue
   * messages never reach the router.
   */
  PROCESSING_SHARED_SECRET?: string;
}
