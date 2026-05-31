import type { InterviewVideo } from '@sesap/types';
import { ValidationError } from './errors';

export interface KalturaSource {
  entryId: string;
  partnerId?: string;
  widgetId?: string;
  uiconfId?: string;
  embedUrl?: string;
}

const ENTRY_ID_PATTERN = /^\d+_[a-z0-9]+$/i;
const DEFAULT_KALTURA_UICONF_ID = '44855082';

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

function firstHttpUrlFromText(input: string): string | null {
  const decoded = htmlDecode(input);
  const match = decoded.match(/https?:\/\/[^\s"'<>]+/i);
  return match ? match[0] : null;
}

function safeHttpsUrl(rawUrl: string): URL | null {
  let url: URL;
  try {
    url = new URL(htmlDecode(rawUrl));
  } catch {
    return null;
  }
  return url.protocol === 'https:' ? url : null;
}

function parseKalturaUrl(rawUrl: string): KalturaSource | null {
  let url: URL;
  try {
    url = new URL(htmlDecode(rawUrl));
  } catch {
    return null;
  }

  let entryId: string | undefined;
  let partnerId: string | undefined;
  let widgetId: string | undefined;
  let uiconfId: string | undefined;

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
    if (seg === 'uiconf_id' && segments[i + 1] && /^\d+$/.test(segments[i + 1])) {
      uiconfId = segments[i + 1];
    }
    if (!entryId && (seg === 't' || seg === 'media' || seg === 'entryId') && segments[i + 1]) {
      const candidate = segments[i + 1];
      if (ENTRY_ID_PATTERN.test(candidate)) {
        entryId = candidate;
      }
    }
  }

  if (!entryId) return null;
  return { entryId, partnerId, widgetId, uiconfId, embedUrl: url.toString() };
}

export function buildKalturaEmbedUrl(source: {
  entryId: string;
  partnerId: string;
  widgetId?: string;
  uiconfId?: string;
}): string {
  const uiconfId = source.uiconfId ?? DEFAULT_KALTURA_UICONF_ID;
  const url = new URL(
    `https://cdnapisec.kaltura.com/p/${source.partnerId}/embedPlaykitJs/uiconf_id/${uiconfId}`,
  );
  url.searchParams.set('iframeembed', 'true');
  url.searchParams.set('entry_id', source.entryId);
  if (source.widgetId) {
    url.searchParams.set('config[provider]', JSON.stringify({ widgetId: source.widgetId }));
  }
  url.searchParams.set('config[playback]', JSON.stringify({ startTime: 0 }));
  return url.toString();
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

export interface ParseVideoEmbedOptions {
  fallbackKalturaPartnerId?: string;
  fallbackKalturaUiconfId?: string;
}

function parseYouTubeUrl(url: URL, sourceUrl: string): InterviewVideo | null {
  let videoId: string | undefined;

  if (url.hostname === 'youtu.be') {
    videoId = url.pathname.split('/').filter(Boolean)[0];
  } else if (url.hostname.endsWith('youtube.com') || url.hostname.endsWith('youtube-nocookie.com')) {
    const segments = url.pathname.split('/').filter(Boolean);
    if (url.pathname === '/watch') videoId = url.searchParams.get('v') ?? undefined;
    else if (segments[0] === 'embed' || segments[0] === 'shorts') videoId = segments[1];
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) return null;

  return {
    provider: 'youtube',
    embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
    sourceUrl,
  };
}

function parseVimeoUrl(url: URL, sourceUrl: string): InterviewVideo | null {
  if (!url.hostname.endsWith('vimeo.com')) return null;
  const segments = url.pathname.split('/').filter(Boolean);
  const videoId = segments.find((seg) => /^\d+$/.test(seg));
  if (!videoId) return null;
  return {
    provider: 'vimeo',
    embedUrl: `https://player.vimeo.com/video/${videoId}`,
    sourceUrl,
  };
}

function parseGenericIframe(input: string): InterviewVideo | null {
  const iframeSrc = extractIframeSrc(input);
  if (!iframeSrc) return null;
  const url = safeHttpsUrl(iframeSrc);
  if (!url) return null;
  return {
    provider: 'iframe',
    embedUrl: url.toString(),
    sourceUrl: iframeSrc,
  };
}

export function parseVideoEmbed(
  input: string,
  options: ParseVideoEmbedOptions = {},
): InterviewVideo {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new ValidationError('Video embed source is empty');
  }

  try {
    const kaltura = parseKalturaSource(trimmed);
    const partnerId = kaltura.partnerId ?? options.fallbackKalturaPartnerId;
    if (partnerId) {
      return {
        provider: 'kaltura',
        embedUrl: buildKalturaEmbedUrl({
          entryId: kaltura.entryId,
          partnerId,
          widgetId: kaltura.widgetId,
          uiconfId: kaltura.uiconfId ?? options.fallbackKalturaUiconfId,
        }),
        sourceUrl: kaltura.embedUrl ?? firstHttpUrlFromText(trimmed) ?? trimmed,
        entryId: kaltura.entryId,
        partnerId,
        widgetId: kaltura.widgetId,
        uiconfId: kaltura.uiconfId ?? options.fallbackKalturaUiconfId,
      };
    }
  } catch (err) {
    if (!(err instanceof ValidationError)) throw err;
  }

  const iframeSrc = extractIframeSrc(trimmed);
  const candidateUrl = iframeSrc ?? trimmed;
  const url = safeHttpsUrl(candidateUrl);
  if (url) {
    const sourceUrl = url.toString();
    const youtube = parseYouTubeUrl(url, sourceUrl);
    if (youtube) return youtube;
    const vimeo = parseVimeoUrl(url, sourceUrl);
    if (vimeo) return vimeo;
  }

  const generic = parseGenericIframe(trimmed);
  if (generic) return generic;

  throw new ValidationError(
    'Could not extract a supported HTTPS video embed URL',
  );
}
