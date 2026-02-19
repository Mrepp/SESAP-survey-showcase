import type { Interview, Analysis } from '@sesap/types';
import { R2_PATHS } from '@sesap/types';
import { NotFoundError } from '@sesap/shared';

export async function uploadTranscript(bucket: R2Bucket, id: string, text: string): Promise<void> {
  await bucket.put(R2_PATHS.transcript(id), text, {
    httpMetadata: { contentType: 'text/plain' },
  });
}

export async function getTranscript(bucket: R2Bucket, id: string): Promise<string> {
  const object = await bucket.get(R2_PATHS.transcript(id));
  if (!object) {
    throw new NotFoundError('Transcript', id);
  }
  return object.text();
}

export async function getAnalysis(bucket: R2Bucket, id: string): Promise<Analysis> {
  const object = await bucket.get(R2_PATHS.analysis(id));
  if (!object) {
    throw new NotFoundError('Analysis', id);
  }
  return object.json<Analysis>();
}

export async function getEmbeddings(bucket: R2Bucket, id: string): Promise<unknown> {
  const object = await bucket.get(R2_PATHS.embeddings(id));
  if (!object) {
    return null;
  }
  return object.json();
}

export async function putAnalysis(bucket: R2Bucket, id: string, analysis: Analysis): Promise<void> {
  await bucket.put(R2_PATHS.analysis(id), JSON.stringify(analysis), {
    httpMetadata: { contentType: 'application/json' },
  });
}

export async function storeInterview(bucket: R2Bucket, id: string, interview: Interview): Promise<void> {
  await bucket.put(R2_PATHS.interview(id), JSON.stringify(interview), {
    httpMetadata: { contentType: 'application/json' },
  });
}
