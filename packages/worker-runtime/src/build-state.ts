import { KV_KEYS } from '@sesap/types';
import type { BuildDirtyState } from '@sesap/types';

interface BuildStateKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

const EMPTY: BuildDirtyState = {
  isDirty: false,
  pendingChanges: 0,
  lastChangeAt: '',
  lastChangeType: 'approve',
  lastBuildAt: null,
};

export async function readBuildDirty(kv: BuildStateKV): Promise<BuildDirtyState | null> {
  const raw = await kv.get(KV_KEYS.buildDirty);
  return raw ? (JSON.parse(raw) as BuildDirtyState) : null;
}

/**
 * Record that the published build no longer reflects the approved set.
 *
 * Admin calls this on approve, reject-after-approve, delete, edit and
 * reprocess. It is a read-modify-write on KV, so two simultaneous callers can
 * under-count `pendingChanges`; `isDirty` and `lastChangeAt` are what the
 * build actually reads, and both are monotone under a lost update.
 */
export async function markBuildDirty(
  kv: BuildStateKV,
  changeType: BuildDirtyState['lastChangeType'],
): Promise<void> {
  const current = (await readBuildDirty(kv)) ?? { ...EMPTY, lastChangeType: changeType };
  current.isDirty = true;
  current.pendingChanges += 1;
  current.lastChangeAt = new Date().toISOString();
  current.lastChangeType = changeType;
  await kv.put(KV_KEYS.buildDirty, JSON.stringify(current));
}

/**
 * Called by indexing once a build is published. The flag is cleared only if
 * no change landed after the build started reading state; a change that raced
 * the build stays dirty, which is what the next build is for. Indexing owns
 * this because it is the only party that knows what it actually read.
 */
export async function completeBuild(kv: BuildStateKV, buildStartedAt: string): Promise<BuildDirtyState> {
  const current = (await readBuildDirty(kv)) ?? { ...EMPTY };
  const changedDuringBuild = current.lastChangeAt !== '' && current.lastChangeAt > buildStartedAt;

  if (!changedDuringBuild) {
    current.isDirty = false;
    current.pendingChanges = 0;
  }
  current.lastBuildAt = new Date().toISOString();

  await kv.put(KV_KEYS.buildDirty, JSON.stringify(current));
  return current;
}
