import { describe, expect, it } from 'vitest';
import { KV_KEYS } from '@sesap/types';
import { completeBuild, markBuildDirty, readBuildDirty } from '../src/build-state';

class MockKV {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async put(key: string, value: string) { this.store.set(key, value); }
}

describe('build dirty state', () => {
  it('marks and counts changes', async () => {
    const kv = new MockKV();
    await markBuildDirty(kv, 'approve');
    await markBuildDirty(kv, 'edit');

    expect(await readBuildDirty(kv)).toMatchObject({
      isDirty: true,
      pendingChanges: 2,
      lastChangeType: 'edit',
    });
  });

  it('clears the flag when nothing changed after the build started', async () => {
    const kv = new MockKV();
    await markBuildDirty(kv, 'approve');
    const startedAt = new Date(Date.now() + 1000).toISOString();

    const state = await completeBuild(kv, startedAt);

    expect(state.isDirty).toBe(false);
    expect(state.pendingChanges).toBe(0);
    expect(state.lastBuildAt).not.toBeNull();
  });

  it('keeps the flag when an approval raced the build', async () => {
    const kv = new MockKV();
    const startedAt = new Date(Date.now() - 1000).toISOString();
    await markBuildDirty(kv, 'approve');

    const state = await completeBuild(kv, startedAt);

    // The build read state before this approval landed, so the showcase is
    // still behind and the flag has to say so.
    expect(state.isDirty).toBe(true);
    expect(state.pendingChanges).toBe(1);
    expect(state.lastBuildAt).not.toBeNull();
  });

  it('records a build even when nothing was ever dirty', async () => {
    const kv = new MockKV();
    const state = await completeBuild(kv, new Date().toISOString());
    expect(state.isDirty).toBe(false);
    expect(await kv.get(KV_KEYS.buildDirty)).not.toBeNull();
  });
});
