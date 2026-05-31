import type { ProcessingQueueMessage } from '@sesap/types';

export interface Env {
  ASSETS: Fetcher;
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;
  PROCESSING_WORKER: Fetcher;
  PROCESSING_QUEUE: Queue<ProcessingQueueMessage>;
  INDEXING_WORKER: Fetcher;
  ENVIRONMENT: string;
  SHOWCASE_URL: string;
  NEXT_DEV_URL?: string;
  GITHUB_ALLOWED_USERS?: string;
  KALTURA_PARTNER_ID?: string;
  KALTURA_UICONF_ID?: string;
}
