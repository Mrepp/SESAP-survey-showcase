import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { Interview } from '@sesap/types';
import { makeEmbeddings, makeRecord } from '../fixtures/sample-interview';

interface SeedEnv {
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;
}

export async function seedApprovedInterview(env: SeedEnv, interview: Interview): Promise<void> {
  const record = makeRecord(interview);
  const embeddings = makeEmbeddings(interview);

  await env.SESAP_BUCKET.put(R2_PATHS.transcript(interview.id), interview.transcript.rawText);
  await env.SESAP_BUCKET.put(R2_PATHS.analysis(interview.id), JSON.stringify(interview.analysis));
  await env.SESAP_BUCKET.put(R2_PATHS.embeddings(interview.id), JSON.stringify(embeddings));
  await env.SESAP_BUCKET.put(R2_PATHS.interview(interview.id), JSON.stringify(interview));

  await env.SESAP_KV.put(KV_KEYS.interview(interview.id), JSON.stringify(record));

  const listRaw = await env.SESAP_KV.get(KV_KEYS.interviewsList);
  const list: string[] = listRaw ? JSON.parse(listRaw) : [];
  if (!list.includes(interview.id)) list.push(interview.id);
  await env.SESAP_KV.put(KV_KEYS.interviewsList, JSON.stringify(list));
}

export async function clearAll(env: SeedEnv): Promise<void> {
  const listRaw = await env.SESAP_KV.get(KV_KEYS.interviewsList);
  const ids: string[] = listRaw ? JSON.parse(listRaw) : [];
  for (const id of ids) {
    await env.SESAP_BUCKET.delete(R2_PATHS.transcript(id));
    await env.SESAP_BUCKET.delete(R2_PATHS.analysis(id));
    await env.SESAP_BUCKET.delete(R2_PATHS.embeddings(id));
    await env.SESAP_BUCKET.delete(R2_PATHS.interview(id));
    await env.SESAP_KV.delete(KV_KEYS.interview(id));
  }
  await env.SESAP_KV.delete(KV_KEYS.interviewsList);
  await env.SESAP_KV.delete(KV_KEYS.buildManifest);
  await env.SESAP_KV.delete(KV_KEYS.buildDirty);

  for (const name of [
    'vector-indices.json',
    'clusters.json',
    'search-index.json',
    'interviews.json',
    'metadata.json',
  ]) {
    await env.SESAP_BUCKET.delete(R2_PATHS.buildArtifact(name));
  }
}

export async function getJson<T>(bucket: R2Bucket, key: string): Promise<T | null> {
  const obj = await bucket.get(key);
  if (!obj) return null;
  return (await obj.json()) as T;
}
