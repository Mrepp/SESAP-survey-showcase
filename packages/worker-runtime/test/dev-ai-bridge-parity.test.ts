import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { EMBEDDING_DIMENSION } from '@sesap/dev-fixtures';
import { WORKERS_AI_MODELS } from '../src';

/**
 * `scripts/dev-ai-bridge.mjs` is dependency-free plain Node with no build step,
 * so it mirrors the model ids and the embedding width rather than importing
 * them. Drift would make bridge mode silently disagree with fixture mode.
 */
const source = readFileSync(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    '..',
    'scripts',
    'dev-ai-bridge.mjs',
  ),
  'utf8',
);

describe('the AI bridge mirrors the shared constants', () => {
  it('uses the same embedding dimension', () => {
    expect(source).toContain(`const EMBEDDING_DIMENSION = ${EMBEDDING_DIMENSION};`);
  });

  it.each(Object.entries(WORKERS_AI_MODELS))('knows the %s model id', (_kind, model) => {
    expect(source).toContain(model);
  });
});
