# @sesap/dev-fixtures

Canned interviews, analyses, transcripts and embeddings shared by the local dev
stack (`pnpm seed`, the `fixture` AI provider, `scripts/dev-ai-bridge.mjs`) and
the e2e suites.

It deliberately has **no `vitest` dependency**. `@sesap/test-utils` does — its
mocks are built on `vi.fn()` — which is exactly why its fixtures cannot be
reused at runtime inside a worker. Anything both a test and a running worker
need belongs here instead.
