// Best-effort client-side Kaltura parser for live preview only.
// The server (packages/shared/src/kaltura-parser.ts) is the source of truth.

export interface KalturaPreview {
  entryId?: string;
  partnerId?: string;
  widgetId?: string;
  ok: boolean;
}

const ENTRY_ID_PATTERN = /^\d+_[a-z0-9]+$/i;

function htmlDecode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractIframeSrc(input: string): string | null {
  const match = input.match(/<iframe[^>]*\ssrc\s*=\s*(['"])(.*?)\1/i);
  return match ? htmlDecode(match[2]) : null;
}

function parseUrl(rawUrl: string): KalturaPreview {
  try {
    const url = new URL(rawUrl);
    const entryId = url.searchParams.get('entry_id') ?? undefined;
    let partnerId: string | undefined;
    let widgetId: string | undefined;

    const providerParam = url.searchParams.get('config[provider]');
    if (providerParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(providerParam));
        if (decoded && typeof decoded.widgetId === 'string') widgetId = decoded.widgetId;
      } catch {
        // ignore
      }
    }

    let pathEntryId = entryId;
    const segments = url.pathname.split('/').filter(Boolean);
    for (let i = 0; i < segments.length; i++) {
      if (segments[i] === 'p' && /^\d+$/.test(segments[i + 1] ?? '')) {
        partnerId = segments[i + 1];
      }
      if (
        !pathEntryId &&
        (segments[i] === 't' || segments[i] === 'media' || segments[i] === 'entryId') &&
        segments[i + 1]
      ) {
        if (ENTRY_ID_PATTERN.test(segments[i + 1])) pathEntryId = segments[i + 1];
      }
    }

    if (!pathEntryId) return { ok: false };
    return { ok: true, entryId: pathEntryId, partnerId, widgetId };
  } catch {
    return { ok: false };
  }
}

export function previewKalturaSource(input: string): KalturaPreview {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false };

  if (ENTRY_ID_PATTERN.test(trimmed)) {
    return { ok: true, entryId: trimmed };
  }

  const iframeSrc = extractIframeSrc(trimmed);
  if (iframeSrc) {
    const fromIframe = parseUrl(iframeSrc);
    if (fromIframe.ok) return fromIframe;
  }

  return parseUrl(trimmed);
}
