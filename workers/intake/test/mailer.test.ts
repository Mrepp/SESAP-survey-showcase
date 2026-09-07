import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockEnv } from '@sesap/test-utils';
import type { Env } from '../src/bindings';
import { MailNotConfiguredError, buildRawMessage, selectTransport, sendEmail } from '../src/services/mailer';

const EMAIL = { to: 'beaver@oregonstate.edu', subject: 'Hello', text: 'Body text.' };

function makeEnv(overrides: Partial<Env> = {}): Env {
  return createMockEnv<Env>({
    ENVIRONMENT: 'development',
    EMAIL_FROM: 'sesap@localhost',
    ...overrides,
  } as Partial<Env>);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('transport selection', () => {
  it('prefers Cloudflare Email Service whenever the binding exists', () => {
    const env = makeEnv({
      EMAIL: { send: vi.fn() },
      DEV_MAIL_URL: 'http://127.0.0.1:8025/api/v1/send',
    });
    expect(selectTransport(env).name).toBe('cloudflare-email');
  });

  it('uses the dev catcher in development when DEV_MAIL_URL is set', () => {
    const env = makeEnv({ DEV_MAIL_URL: 'http://127.0.0.1:8025/api/v1/send' });
    expect(selectTransport(env).name).toBe('dev-mail-catcher');
  });

  it.each(['staging', 'production'])(
    'refuses to send in %s without the EMAIL binding, even if DEV_MAIL_URL leaked in',
    (environment) => {
      // Neither the catcher nor the log is a transport outside development: a
      // logged verification code would be a login credential in a log file,
      // and a 200 for a mail that was never sent would hide the outage.
      const env = makeEnv({ ENVIRONMENT: environment, DEV_MAIL_URL: 'http://127.0.0.1:8025/api/v1/send' });
      expect(() => selectTransport(env)).toThrow(MailNotConfiguredError);
    },
  );

  it('still delivers through Email Service outside development', () => {
    const env = makeEnv({ ENVIRONMENT: 'production', EMAIL: { send: vi.fn() } });
    expect(selectTransport(env).name).toBe('cloudflare-email');
  });

  it('falls back to logging in development with no binding and no catcher', () => {
    expect(selectTransport(makeEnv()).name).toBe('log-only');
  });
});

describe('sending', () => {
  it('hands Email Service an RFC 5322 message', async () => {
    const send = vi.fn();
    const env = makeEnv({ EMAIL: { send } });

    await sendEmail(env, EMAIL);

    expect(send).toHaveBeenCalledWith({
      from: 'sesap@localhost',
      to: EMAIL.to,
      raw: buildRawMessage('sesap@localhost', EMAIL),
    });
  });

  it('POSTs the catcher a message it can render', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const env = makeEnv({ DEV_MAIL_URL: 'http://127.0.0.1:8025/api/v1/send' });

    await sendEmail(env, EMAIL);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://127.0.0.1:8025/api/v1/send');
    expect(JSON.parse(String(init.body))).toEqual({
      From: { Email: 'sesap@localhost' },
      To: [{ Email: EMAIL.to }],
      Subject: EMAIL.subject,
      Text: EMAIL.text,
    });
  });

  it('throws when the configured catcher is down, rather than degrading quietly', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    const env = makeEnv({ DEV_MAIL_URL: 'http://127.0.0.1:8025/api/v1/send' });

    await expect(sendEmail(env, EMAIL)).rejects.toThrow(/returned 500/);
  });

  it('logs and resolves when nothing is configured in development', async () => {
    await expect(sendEmail(makeEnv(), EMAIL)).resolves.toBeUndefined();
  });

  it('answers 503 when nothing is configured in production', async () => {
    await expect(sendEmail(makeEnv({ ENVIRONMENT: 'production' }), EMAIL)).rejects.toMatchObject({
      statusCode: 503,
      code: 'MAIL_NOT_CONFIGURED',
    });
  });
});

describe('buildRawMessage', () => {
  it('folds CR/LF in headers to spaces so neither can start a new header', () => {
    const raw = buildRawMessage('sesap@localhost', {
      to: 'a@b.c\r\nBcc: attacker@evil.example',
      subject: 'Hi\r\nX-Injected: yes',
      text: 'Body.',
    });

    const [headers, body] = raw.split('\r\n\r\n');
    // The injected text survives inside the header it was smuggled into; what
    // must not survive is the line break that would make it a header of its own.
    expect(headers.split('\r\n').map((line) => line.split(':')[0])).toEqual([
      'From',
      'To',
      'Subject',
      'MIME-Version',
      'Content-Type',
    ]);
    expect(body).toBe('Body.');
  });
});
