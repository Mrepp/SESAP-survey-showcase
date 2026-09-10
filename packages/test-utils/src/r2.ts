import { vi } from 'vitest';

interface StoredObject {
  body: Uint8Array;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
}

interface PendingMultipart {
  key: string;
  parts: Map<number, Uint8Array>;
}

export interface MockR2Bucket extends R2Bucket {
  /** Keys currently present, sorted — a readable assertion target. */
  keys(): string[];
  /** Raw bytes for a key, or `undefined`. */
  raw(key: string): Uint8Array | undefined;
}

function toBytes(value: unknown): Uint8Array {
  if (value === null || value === undefined) return new Uint8Array();
  if (typeof value === 'string') return new TextEncoder().encode(value);
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  return new TextEncoder().encode(String(value));
}

function asR2Object(key: string, stored: StoredObject): R2ObjectBody {
  const bytes = stored.body;
  return {
    key,
    size: bytes.byteLength,
    etag: `etag-${key}`,
    httpEtag: `"etag-${key}"`,
    uploaded: new Date(0),
    httpMetadata: stored.httpMetadata,
    customMetadata: stored.customMetadata,
    body: null,
    bodyUsed: false,
    text: async () => new TextDecoder().decode(bytes),
    json: async () => JSON.parse(new TextDecoder().decode(bytes)),
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    blob: async () => new Blob([bytes]),
    writeHttpMetadata: () => {},
  } as unknown as R2ObjectBody;
}

/**
 * In-memory `R2Bucket` with a working multipart implementation, so upload
 * flows can be tested for part ordering and completion rather than stubbed out.
 */
export function createMockR2Bucket(): MockR2Bucket {
  const objects = new Map<string, StoredObject>();
  const multipart = new Map<string, PendingMultipart>();
  let uploadCounter = 0;

  const mock = {
    put: vi.fn(async (key: string, value: unknown, putOptions?: R2PutOptions) => {
      objects.set(key, {
        body: toBytes(value),
        httpMetadata: putOptions?.httpMetadata as R2HTTPMetadata | undefined,
        customMetadata: putOptions?.customMetadata,
      });
      return asR2Object(key, objects.get(key)!);
    }),

    get: vi.fn(async (key: string) => {
      const stored = objects.get(key);
      return stored ? asR2Object(key, stored) : null;
    }),

    head: vi.fn(async (key: string) => {
      const stored = objects.get(key);
      return stored ? asR2Object(key, stored) : null;
    }),

    delete: vi.fn(async (keys: string | string[]) => {
      for (const key of Array.isArray(keys) ? keys : [keys]) objects.delete(key);
    }),

    list: vi.fn(async (listOptions?: R2ListOptions) => {
      const prefix = listOptions?.prefix ?? '';
      const matching = [...objects.keys()].filter((key) => key.startsWith(prefix)).sort();
      return {
        objects: matching.map((key) => asR2Object(key, objects.get(key)!)),
        truncated: false,
        delimitedPrefixes: [],
      } as unknown as R2Objects;
    }),

    createMultipartUpload: vi.fn(async (key: string) => {
      uploadCounter += 1;
      const uploadId = `upload-${uploadCounter}`;
      multipart.set(uploadId, { key, parts: new Map() });
      return makeMultipartHandle(key, uploadId);
    }),

    resumeMultipartUpload: vi.fn((key: string, uploadId: string) =>
      makeMultipartHandle(key, uploadId),
    ),
  };

  function makeMultipartHandle(key: string, uploadId: string): R2MultipartUpload {
    return {
      key,
      uploadId,
      uploadPart: async (partNumber: number, value: unknown) => {
        const pending = multipart.get(uploadId);
        if (!pending) throw new Error(`Unknown multipart upload: ${uploadId}`);
        pending.parts.set(partNumber, toBytes(value));
        return { partNumber, etag: `etag-${uploadId}-${partNumber}` };
      },
      abort: async () => {
        multipart.delete(uploadId);
      },
      complete: async (parts: R2UploadedPart[]) => {
        const pending = multipart.get(uploadId);
        if (!pending) throw new Error(`Unknown multipart upload: ${uploadId}`);

        // R2 assembles strictly in ascending part order regardless of the order
        // parts were uploaded — reproduce that so ordering bugs surface here.
        const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber);
        const chunks: Uint8Array[] = [];
        for (const part of ordered) {
          const bytes = pending.parts.get(part.partNumber);
          if (!bytes) throw new Error(`Missing part ${part.partNumber} for ${uploadId}`);
          chunks.push(bytes);
        }

        const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
        const body = new Uint8Array(total);
        let offset = 0;
        for (const chunk of chunks) {
          body.set(chunk, offset);
          offset += chunk.byteLength;
        }

        objects.set(pending.key, { body });
        multipart.delete(uploadId);
        return asR2Object(pending.key, objects.get(pending.key)!);
      },
    } as unknown as R2MultipartUpload;
  }

  return Object.assign(mock, {
    keys: () => [...objects.keys()].sort(),
    raw: (key: string) => objects.get(key)?.body,
  }) as unknown as MockR2Bucket;
}
