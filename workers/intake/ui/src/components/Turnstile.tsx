'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';

/**
 * The Turnstile widget.
 *
 * The site key is fetched from the worker rather than baked in at build time:
 * the UI is a static export served from one ASSETS binding, so a
 * `NEXT_PUBLIC_*` value would pin the bundle to a single environment. See
 * `workers/intake/src/routes/config.ts`.
 *
 * When no site key is configured no widget renders and the token stays empty.
 * That is a working state only in development — with a secret configured the
 * worker refuses a token-less request, and outside development it refuses the
 * request whether or not a token came with it.
 */

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    },
  ): string;
  remove(widgetId: string): void;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** One shared script tag, resolved once however many times this mounts. */
function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  const script = existing ?? document.createElement('script');

  const ready = new Promise<void>((resolve, reject) => {
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Could not load the challenge.')));
  });

  if (!existing) {
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  return ready;
}

export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string;
  /** Empty string whenever the widget has no valid token — expiry included. */
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let widgetId: string | undefined;
    let cancelled = false;
    const container = containerRef.current;

    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          callback: (token: string) => onToken(token),
          // A token is single-use and short-lived. Clearing it on expiry means
          // the form disables itself rather than sending one the worker will
          // reject.
          'expired-callback': () => onToken(''),
          'error-callback': () => {
            onToken('');
            setError('The challenge could not be completed. Reload the page and try again.');
          },
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load the challenge.');
        }
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;

  return (
    <Box mb={4}>
      <div ref={containerRef} />
      {error && (
        <Text fontSize="sm" color="red.600" mt={2}>
          {error}
        </Text>
      )}
    </Box>
  );
}
