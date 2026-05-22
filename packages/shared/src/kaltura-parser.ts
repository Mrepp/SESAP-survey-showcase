import { ValidationError } from './errors';

export interface KalturaSource {
  entryId: string;
  partnerId?: string;
  widgetId?: string;
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

function parseProviderWidgetId(value: string): string | undefined {
  try {
    const json = JSON.parse(decodeURIComponent(value));
    if (json && typeof json === 'object' && typeof json.widgetId === 'string') {
      return json.widgetId;
    }
  } catch {
    // ignore — best-effort parse
  }
  return undefined;
}

function parseKalturaUrl(rawUrl: string): KalturaSource | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  let entryId: string | undefined;
  let partnerId: string | undefined;
  let widgetId: string | undefined;

  entryId = url.searchParams.get('entry_id') ?? undefined;

  const providerParam = url.searchParams.get('config[provider]');
  if (providerParam) {
    widgetId = parseProviderWidgetId(providerParam);
  }

  // Path-based fallbacks
  const segments = url.pathname.split('/').filter(Boolean);
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg === 'p' && segments[i + 1] && /^\d+$/.test(segments[i + 1])) {
      partnerId = segments[i + 1];
    }
    if (!entryId && (seg === 't' || seg === 'media' || seg === 'entryId') && segments[i + 1]) {
      const candidate = segments[i + 1];
      if (ENTRY_ID_PATTERN.test(candidate)) {
        entryId = candidate;
      }
    }
  }

  if (!entryId) return null;
  return { entryId, partnerId, widgetId };
}

/**
 * Parse a Kaltura source from the admin's input. Accepts:
 *   - A full embed `<iframe ...>` HTML snippet
 *   - A media page URL (e.g. https://media.oregonstate.edu/media/t/{entryId}/...)
 *   - A Kaltura CDN URL containing entry_id and p/{partnerId} segments
 *   - A bare entry id like `1_oixah593`
 *
 * Returns the parsed components. The caller is responsible for filling in
 * `partnerId` from configuration when the input doesn't carry one.
 *
 * Throws ValidationError when no entry id can be extracted.
 */
export function parseKalturaSource(input: string): KalturaSource {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new ValidationError('Kaltura source is empty');
  }

  // Bare entry id
  if (ENTRY_ID_PATTERN.test(trimmed)) {
    return { entryId: trimmed };
  }

  // Iframe embed
  const iframeSrc = extractIframeSrc(trimmed);
  if (iframeSrc) {
    const parsed = parseKalturaUrl(iframeSrc);
    if (parsed) return parsed;
  }

  // Treat the whole input as a URL
  const parsed = parseKalturaUrl(trimmed);
  if (parsed) return parsed;

  throw new ValidationError(
    'Could not extract a Kaltura entry id from the provided source',
  );
}
