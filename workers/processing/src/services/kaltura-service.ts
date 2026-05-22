import { Logger, NotFoundError, ProcessingError } from '@sesap/shared';
import type { KalturaRef } from '@sesap/types';

const logger = new Logger({ service: 'kaltura-service' });

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB safety cap

function buildPlayManifestUrl(partnerId: string, entryId: string): string {
  return (
    `https://cdnapisec.kaltura.com/p/${partnerId}/sp/${partnerId}00` +
    `/playManifest/entryId/${entryId}/format/url/protocol/https/video.mp4`
  );
}

export async function fetchMedia(ref: KalturaRef): Promise<ArrayBuffer> {
  if (!ref.partnerId) {
    throw new ProcessingError('Kaltura partner id is missing', { entryId: ref.entryId });
  }

  const url = buildPlayManifestUrl(ref.partnerId, ref.entryId);
  logger.info('Fetching Kaltura media', { entryId: ref.entryId, partnerId: ref.partnerId });

  const response = await fetch(url, { redirect: 'follow' });

  if (response.status === 404) {
    throw new NotFoundError('Kaltura entry', ref.entryId);
  }
  if (response.status === 403) {
    throw new ProcessingError(
      'Kaltura entry is not publicly accessible — authenticated download is not yet supported',
      { entryId: ref.entryId, status: 403 },
    );
  }
  if (!response.ok) {
    throw new ProcessingError(`Kaltura fetch failed (${response.status})`, {
      entryId: ref.entryId,
      status: response.status,
    });
  }

  const contentLengthHeader = response.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);
    if (Number.isFinite(contentLength) && contentLength > MAX_BYTES) {
      throw new ProcessingError(
        `Kaltura media exceeds maximum supported size (${contentLength} bytes > ${MAX_BYTES})`,
        { entryId: ref.entryId, contentLength },
      );
    }
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    throw new ProcessingError(
      `Kaltura media exceeds maximum supported size (${buffer.byteLength} bytes > ${MAX_BYTES})`,
      { entryId: ref.entryId },
    );
  }

  logger.info('Kaltura media fetched', {
    entryId: ref.entryId,
    sizeBytes: buffer.byteLength,
  });
  return buffer;
}
