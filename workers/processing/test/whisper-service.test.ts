import { describe, it, expect, vi } from 'vitest';
import { transcribeAudio } from '../src/services/whisper-service';
import { ProcessingError } from '@sesap/shared';
import type { Env } from '../src/bindings';

function createEnvWith(runImpl: (...args: unknown[]) => Promise<unknown>): Env {
  return {
    AI: { run: vi.fn(runImpl) },
    SESAP_BUCKET: {} as R2Bucket,
    SESAP_KV: {} as KVNamespace,
    ENVIRONMENT: 'test',
  } as unknown as Env;
}

const ONE_KB_AUDIO = new Uint8Array(1024).buffer;

describe('whisper-service.transcribeAudio', () => {
  it('returns the trimmed text from a successful call', async () => {
    const env = createEnvWith(async () => ({ text: '  hello world  ' }));
    const text = await transcribeAudio(env, ONE_KB_AUDIO, { interviewId: 'iv1' });
    expect(text).toBe('hello world');
  });

  it('throws ProcessingError on empty audio', async () => {
    const env = createEnvWith(async () => ({ text: 'should not be called' }));
    await expect(
      transcribeAudio(env, new ArrayBuffer(0), { interviewId: 'iv2' }),
    ).rejects.toBeInstanceOf(ProcessingError);
  });

  it('retries up to 3 times before failing', async () => {
    const run = vi.fn(async () => {
      throw new Error('boom');
    });
    const env = { AI: { run } } as unknown as Env;
    await expect(
      transcribeAudio(env, ONE_KB_AUDIO, { interviewId: 'iv3' }),
    ).rejects.toBeInstanceOf(ProcessingError);
    expect(run).toHaveBeenCalledTimes(3);
  }, 20000);

  it('throws when whisper returns an empty string', async () => {
    const env = createEnvWith(async () => ({ text: '' }));
    await expect(
      transcribeAudio(env, ONE_KB_AUDIO, { interviewId: 'iv4' }),
    ).rejects.toBeInstanceOf(ProcessingError);
  }, 20000);
});
