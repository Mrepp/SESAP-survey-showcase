import type { NotificationMessage, ProcessingQueueMessage } from '@sesap/types';

export interface Env {
  ASSETS: Fetcher;
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;
  PROCESSING_WORKER: Fetcher;
  PROCESSING_QUEUE: Queue<ProcessingQueueMessage>;
  NOTIFICATION_QUEUE?: Queue<NotificationMessage>;
  INDEXING_WORKER: Fetcher;
  ENVIRONMENT: string;
  SHOWCASE_URL: string;
  /**
   * Cloudflare Access team label (e.g. `acme` for acme.cloudflareaccess.com)
   * and the Access application's audience tag. Both are required outside
   * development: the auth middleware verifies `Cf-Access-Jwt-Assertion` against
   * this team's JWKS and checks `aud` against the tag. With either unset the
   * worker refuses every request rather than trusting the spoofable
   * `Cf-Access-Authenticated-User-Email` header.
   */
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  NEXT_DEV_URL?: string;
  GITHUB_ALLOWED_USERS?: string;
  KALTURA_PARTNER_ID?: string;
  KALTURA_UICONF_ID?: string;
}
