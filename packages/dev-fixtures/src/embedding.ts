import { fnv1aHash } from '@sesap/core';
import { EMBEDDING_DIMENSION } from '@sesap/types';

/**
 * Fixture vectors are the width of `@cf/baai/bge-small-en-v1.5`, the model the
 * pipeline actually uses, so every index shape — vector-indices.json, the
 * cluster centroids, the showcase's client-side cosine search — is the same
 * locally as in staging. Re-exported under its historical name for the e2e
 * suites and the bridge parity test.
 */
export { EMBEDDING_DIMENSION };

/**
 * A stable pseudo-embedding for a string.
 *
 * Same text in, same vector out, forever: seeded data survives a re-seed and a
 * diff of two build artifacts is meaningful. Nearness between two vectors is
 * meaningless — these are not semantic — so anything asserting on ranking
 * quality wants the real model, not this.
 *
 * Seeded from the same FNV-1a basis `@sesap/core` uses for prompt hashes, then
 * advanced with an xorshift-multiply step per component.
 */
export function deterministicEmbedding(text: string, dim = EMBEDDING_DIMENSION): number[] {
  let h = Number.parseInt(fnv1aHash(text), 16) >>> 0;
  const out: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    out[i] = ((h >>> 0) % 1000) / 1000;
  }
  return out;
}

/** Componentwise mean. Returns a zero vector of `dim` for an empty input. */
export function averageEmbeddings(vectors: number[][], dim = EMBEDDING_DIMENSION): number[] {
  if (vectors.length === 0) return new Array(dim).fill(0);
  const width = vectors[0].length;
  const sum = new Array(width).fill(0);
  for (const vector of vectors) {
    for (let i = 0; i < width; i++) sum[i] += vector[i];
  }
  return sum.map((value) => value / vectors.length);
}
