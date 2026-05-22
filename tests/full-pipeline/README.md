# @sesap/full-pipeline

One Playwright spec that runs the **entire** user-visible pipeline against locally-running workers with **real** external services: real Kaltura download, real Whisper transcription, real analysis LLM, real embeddings.

## What it proves

A single passing run proves all of this end-to-end:

1. The admin `POST /api/interviews` (source=kaltura) accepts and persists.
2. The processing queue consumer fetches the media from Kaltura, runs Whisper, runs the analysis LLM, and generates embeddings.
3. The admin UI loads, an interview field can be edited, the save round-trips to the worker.
4. The Approve action and the index rebuild succeed.
5. The freshly-built `metadata.json` includes the new interview ID.
6. The showcase detail page renders the title and at least some LLM-derived content.

If this passes, the full pipeline is alive. If it fails, the step that fails tells you exactly which layer broke.

## Why it isn't in CI

- Real Cloudflare AI charges per call.
- Runtime is typically 5–15 minutes (real video download + Whisper + LLM).
- Requires `wrangler login` credentials that don't exist in CI.
- Requires a real public Kaltura entry.

This is a **local** test. Run it before merging anything that touches the pipeline.

## One-time setup

1. `wrangler login` — so the `[ai]` binding hits real Cloudflare AI on your account.
2. In `workers/admin/wrangler.toml` (generated from `wrangler.example.toml`, gitignored), set `KALTURA_PARTNER_ID` to your real partner id. This is the fallback the worker uses when the submitted Kaltura source doesn't carry one (e.g. a bare entry id).
3. Pre-build the showcase UI once: `pnpm --filter sesap-showcase build:ui`. The showcase worker serves the static export, so the test sees the production-shaped UI.
4. From the repo root: `pnpm install` (picks up this workspace), then `pnpm --filter @sesap/full-pipeline exec playwright install chromium` to install the browser.

## Per-run setup

The Playwright config starts the local dev stack automatically:

- admin + processing + indexing worker on `:8787`
- showcase worker on `:8790`
- admin Next dev server on `:3001`
- showcase Next dev server on `:3000`

If any of those servers are already running, Playwright reuses them.

By default the test uses a known public Kaltura iframe for SESAP Interview 9. To use a different real **public** Kaltura entry (private entries return 403 from the play-manifest endpoint), set `KALTURA_SOURCE`. Accepted forms:

- A full `<iframe ...>` embed snippet (e.g. copy-pasted from the Kaltura "Share" menu)
- A Kaltura media page URL containing the entry id
- A bare entry id like `1_oixah593` (requires `KALTURA_PARTNER_ID` to be set on the worker)

Then from the repo root:

```sh
pnpm test:pipeline
```

Or, for a visible browser:

```sh
make test-pipeline-headed
```

Or with an iframe:

```sh
KALTURA_SOURCE='<iframe src="https://cdnapisec.kaltura.com/p/12345/sp/..."></iframe>' pnpm test:pipeline
```

## Environment variables

| Var | Required | Default | Notes |
|---|---|---|---|
| `KALTURA_SOURCE` | yes | — | iframe HTML, media URL, or bare entry id |
| `ADMIN_WORKER_URL` | no | `http://127.0.0.1:8787` | admin worker base URL |
| `ADMIN_UI_URL` | no | `http://127.0.0.1:3001` | admin Next dev base URL |
| `SHOWCASE_UI_URL` | no | `http://127.0.0.1:3000` | showcase Next dev base URL (the showcase worker proxies UI routes here in dev) |
| `SHOWCASE_WORKER_URL` | no | `http://127.0.0.1:8790` | showcase worker base URL |
| `PROCESSING_TIMEOUT_MS` | no | `900000` | how long to wait for `processingStatus === 'completed'` (Whisper on a long video can take many minutes) |
| `BUILD_TIMEOUT_MS` | no | `60000` | how long to wait for `POST /api/build` to return |
| `PIPELINE_POLL_INTERVAL_MS` | no | `10000` | poll interval while waiting for processing |

## Cleanup

Each run creates one interview tagged `E2E-<timestamp>` and best-effort deletes it at the end (in a `finally`). If a run is killed mid-flight, the leftover interview just sits in your local `.wrangler/state` — the unique marker prevents collisions across runs.

## What this test does NOT cover

- Audio-file upload code path (Kaltura is exercised; raw audio is not).
- Transcript-only path (we always run Whisper here).
- Production Cloudflare Access (admin dev bypass is on).
- Load / concurrency.

These are intentionally out of scope. Add a separate spec if you need to cover them.
