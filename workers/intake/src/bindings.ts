import type { NotificationMessage } from '@sesap/types';

/** Cloudflare Email Service binding (`[[send_email]]`). */
export interface SendEmailBinding {
  send(message: EmailMessageLike): Promise<void>;
}

export interface EmailMessageLike {
  from: string;
  to: string;
  /** RFC 5322 message, built by `services/mailer.ts`. */
  raw: string;
}

/** Cloudflare Rate Limiting binding (`[[ratelimits]]`). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ASSETS: Fetcher;
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;

  /**
   * Intake is the sole consumer of interview-notifications and the only worker
   * that sends mail — that is what keeps processing → intake acyclic.
   */
  EMAIL?: SendEmailBinding;

  /**
   * Per-address verification state: the outstanding code's hash and how many
   * guesses it has taken. A Durable Object, one instance per email, so the
   * attempt cap is enforced by a single actor rather than a KV
   * read-modify-write that parallel guesses could slip past.
   */
  INTAKE_VERIFY: DurableObjectNamespace;

  /**
   * Cloudflare Rate Limiting bindings, one per rule. Optional so unit tests and
   * `wrangler dev` without them still run; outside development a missing
   * binding refuses the request rather than skipping the limit.
   */
  RL_VERIFY_EMAIL?: RateLimitBinding;
  RL_VERIFY_IP?: RateLimitBinding;
  RL_CONFIRM_IP?: RateLimitBinding;
  /**
   * Guesses per address. `RL_CONFIRM_IP` alone leaves one mailbox open to a
   * distributed run: every fresh code resets the attempt counter, so without
   * this an attacker spread over many IPs gets unlimited tries at one address.
   */
  RL_CONFIRM_EMAIL?: RateLimitBinding;
  /** Uploads are the only route that writes to R2; both keys are enforced. */
  RL_UPLOAD_IP?: RateLimitBinding;
  RL_UPLOAD_SESSION?: RateLimitBinding;
  /** The submitter's review editor, which writes `analysis/<id>.json`. */
  RL_REVIEW_IP?: RateLimitBinding;

  ENVIRONMENT: string;
  /** Public origin of this worker, used to build review links in emails. */
  INTAKE_URL: string;
  /**
   * Public origin of the showcase, matching admin's var of the same name. The
   * "your interview is published" mail links into the showcase, not here —
   * intake has no published-interview page of its own.
   */
  SHOWCASE_URL: string;
  EMAIL_FROM: string;
  // TODO(retention): contributor media and the IP/user-agent on the archived
  // consent record are kept indefinitely. There is no sweeper and no
  // `MEDIA_RETENTION_DAYS` var — the var was removed rather than left in place
  // reading like an active control it never was. Adding one means adding a
  // scheduled handler that actually deletes.

  /** HMAC key for the session cookie signature. */
  INTAKE_SESSION_SECRET: string;
  /**
   * Cloudflare Turnstile secret. Required outside development; when unset in
   * development the challenge is skipped.
   */
  TURNSTILE_SECRET_KEY?: string;
  /**
   * Turnstile site key. Public by design — it is handed to the browser by
   * `GET /api/intake/config` so the static UI export does not have to be
   * rebuilt per environment. Unset means "render no widget", which the server
   * only tolerates in development (see `services/turnstile.ts`).
   */
  TURNSTILE_SITE_KEY?: string;

  NEXT_DEV_URL?: string;
  /**
   * Local mail catcher endpoint (Mailpit's `/api/v1/send`). Honored only in
   * development and only when the `EMAIL` binding is absent; see
   * `services/mailer.ts`. Lives in .dev.vars, so it can never reach a deploy.
   */
  DEV_MAIL_URL?: string;
}

export type { NotificationMessage };
