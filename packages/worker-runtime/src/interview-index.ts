import { KV_KEYS } from '@sesap/types';
import type { InterviewRecord } from '@sesap/types';

/**
 * Structural shape of the slice of `KVNamespace` this module needs. Declared
 * locally (rather than importing `@cloudflare/workers-types`) so the package
 * stays checkable under plain `types: ["node"]`, matching `ai-budget.ts`.
 */
interface KVListResult {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
}

export interface InterviewIndexKV {
  get(key: string): Promise<string | null>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<KVListResult>;
}

/**
 * Enumerate every interview id by listing the `interview:` key prefix.
 *
 * There is deliberately no `interviews:list` aggregate key: maintaining one
 * meant a read-modify-write on every create, which silently dropped records
 * when two creates raced. Prefix listing has no such window. The trade is that
 * KV listing is eventually consistent, so a just-created interview can take a
 * few seconds to appear — which every caller here tolerates.
 */
export async function listInterviewIds(kv: InterviewIndexKV): Promise<string[]> {
  const prefix = KV_KEYS.interviewPrefix;
  const ids: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list({ prefix, cursor });
    for (const key of page.keys) {
      ids.push(key.name.slice(prefix.length));
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return ids;
}

/**
 * Enumerate every interview record. Ids whose record has since been deleted are
 * skipped rather than surfacing as holes.
 */
export async function listInterviewRecords(kv: InterviewIndexKV): Promise<InterviewRecord[]> {
  const ids = await listInterviewIds(kv);
  const records: InterviewRecord[] = [];

  for (const id of ids) {
    const raw = await kv.get(KV_KEYS.interview(id));
    if (raw) records.push(JSON.parse(raw) as InterviewRecord);
  }

  return records;
}
