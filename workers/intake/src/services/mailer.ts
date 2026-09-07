import { SesapError, isDevelopment } from '@sesap/core';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';

const logger = new Logger({ worker: 'sesap-intake', module: 'mailer' });

export interface OutboundEmail {
  to: string;
  subject: string;
  /** Plain text only — these are short transactional notes, not newsletters. */
  text: string;
}

/**
 * Build an RFC 5322 message. Header values are stripped of CR/LF so a crafted
 * subject or address cannot inject extra headers.
 */
export function buildRawMessage(from: string, email: OutboundEmail): string {
  const header = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

  return [
    `From: ${header(from)}`,
    `To: ${header(email.to)}`,
    `Subject: ${header(email.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    email.text,
  ].join('\r\n');
}

/**
 * One way of getting a message out of the worker.
 *
 * `applies` decides; `send` delivers. Adding a transport is one object plus one
 * entry in {@link TRANSPORTS} — the order of that array is the resolution
 * order, most specific first.
 */
export interface MailTransport {
  name: string;
  applies(env: Env): boolean;
  send(env: Env, email: OutboundEmail): Promise<void>;
}

/**
 * Cloudflare Email Service. The only transport that delivers to a real inbox,
 * and the only one that can run outside development.
 */
const cloudflareEmail: MailTransport = {
  name: 'cloudflare-email',
  applies: (env) => Boolean(env.EMAIL),
  async send(env, email) {
    await env.EMAIL!.send({
      from: env.EMAIL_FROM,
      to: email.to,
      raw: buildRawMessage(env.EMAIL_FROM, email),
    });
  },
};

/**
 * A local catcher (Mailpit) over its send API. Real delivery of the real
 * template to a real inbox at http://localhost:8025 — and nothing leaves the
 * machine. Development only, and only when `DEV_MAIL_URL` is set; both are
 * required, so this cannot be reached from a deploy even by accident.
 */
const devMailCatcher: MailTransport = {
  name: 'dev-mail-catcher',
  applies: (env) => isDevelopment(env) && Boolean(env.DEV_MAIL_URL),
  async send(env, email) {
    const response = await fetch(env.DEV_MAIL_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        From: { Email: env.EMAIL_FROM },
        To: [{ Email: email.to }],
        Subject: email.subject,
        Text: email.text,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Dev mail catcher at ${env.DEV_MAIL_URL} returned ${response.status}: ${(
          await response.text()
        ).slice(0, 200)}`,
      );
    }
  },
};

export class MailNotConfiguredError extends SesapError {
  constructor() {
    super(
      'Outbound mail is not configured: the EMAIL binding is required outside development',
      'MAIL_NOT_CONFIGURED',
      503,
    );
    this.name = 'MailNotConfiguredError';
  }
}

/**
 * Last resort, development only: log the message. Keeps every local flow
 * except delivery working when no catcher is running, which is why Mailpit is
 * optional rather than a prerequisite. Never outside development — a logged
 * verification code is a login credential in a log file.
 */
const logOnly: MailTransport = {
  name: 'log-only',
  applies: (env) => isDevelopment(env),
  async send(_env, email) {
    logger.warn('No mail transport configured — logging message instead of sending', {
      to: email.to,
      subject: email.subject,
      text: email.text,
    });
  },
};

/** Resolution order, most specific first. */
export const TRANSPORTS: readonly MailTransport[] = [cloudflareEmail, devMailCatcher, logOnly];

/**
 * The transport that would handle a message in this environment. Throws when
 * none applies: outside development that means no `EMAIL` binding, and a
 * deploy that cannot send mail must say so rather than report success.
 */
export function selectTransport(env: Env): MailTransport {
  const transport = TRANSPORTS.find((candidate) => candidate.applies(env));
  if (!transport) throw new MailNotConfiguredError();
  return transport;
}

/**
 * Send transactional mail through whichever transport applies.
 *
 * A dev catcher that is configured but down throws rather than silently
 * degrading: a developer who set `DEV_MAIL_URL` is watching for the message,
 * and a warning in a log they are not reading is worse than a failure.
 */
export async function sendEmail(env: Env, email: OutboundEmail): Promise<void> {
  const transport = selectTransport(env);
  await transport.send(env, email);

  if (transport !== logOnly) {
    // The recipient is PII; the subject and transport are enough to trace a send.
    logger.info('Sent email', { subject: email.subject, transport: transport.name });
  }
}
