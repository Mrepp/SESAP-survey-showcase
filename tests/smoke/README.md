# @sesap/smoke

Live post-deploy smoke tests for the five workers configured in the deployment
workflow. Run after a staging deploy to confirm the live edge is serving the
expected content. The runner uses built-in `fetch` and is idempotent. See
[testing](../../docs/testing.md) for which check to choose.

## What it checks

A successful run does not show that contributors can verify email, upload
media, or review a draft. Use [partner verification](../../docs/partner-verification.md)
for that rehearsal.

| Endpoint | Assertion |
|---|---|
| `GET {ADMIN_URL}/api/health` | skipped if `ADMIN_URL` is empty (see below); else 200 + `{ status: 'ok', worker: 'sesap-admin' }` |
| `GET {INTAKE_URL}/api/health` | 200 + `{ status: 'ok', worker: 'sesap-intake' }` |
| `GET {INTAKE_URL}/` | 200, `text/html` |
| `GET {PROCESSING_URL}/api/health` | 200 + `{ status: 'ok', worker: 'sesap-processing' }` |
| `GET {INDEXING_URL}/api/health` | 200 + `{ status: 'ok', worker: 'sesap-indexing' }` |
| `GET {SHOWCASE_URL}/api/health` | 200 + `{ status: 'ok', worker: 'sesap-showcase' }` |
| `GET {SHOWCASE_URL}/` | 200, `text/html`, contains `<!DOCTYPE html>` and `_next/static/` |
| `GET {SHOWCASE_URL}/assets/build/interviews.json` | 200, non-empty JSON array, first item has string `id` + `title` |
| `GET {SHOWCASE_URL}/assets/build/metadata.json` | 200, JSON with string `buildId`, number `interviewCount`, array `categories`, array `interviewIds` |

## Environment variables

| Var | Required | Notes |
|---|---|---|
| `SHOWCASE_URL` | yes | e.g. `https://sesap-showcase.<acct>.workers.dev` |
| `INTAKE_URL` | yes | staging intake origin |
| `PROCESSING_URL` | yes | |
| `INDEXING_URL` | yes | |
| `ADMIN_URL` | optional | leave empty by default; the admin worker sits behind Cloudflare Access, so an unauthenticated probe redirects to the Access login |
| `SMOKE_RETRIES` | optional | default `3` |
| `SMOKE_DELAY_MS` | optional | default `5000` |
| `SMOKE_TIMEOUT_MS` | optional | default `10000` |

## Run locally

```sh
SHOWCASE_URL=https://<showcase-url> \
INTAKE_URL=https://<intake-url> \
PROCESSING_URL=https://<processing-url> \
INDEXING_URL=https://<indexing-url> \
pnpm test:smoke
```

Run from the repo root with all required URLs set. Running without them exits
with a configuration error rather than testing a deployment.

## In CI

Runs as the `smoke` job in `.github/workflows/deploy.yml`, gated on the
`deploy` matrix completing. URLs are pulled from the per-environment GitHub
Actions variables (`vars.SHOWCASE_URL`, etc.). A failure marks the workflow
run as failed; there is no auto-rollback.

## Why admin is skipped by default

`workers/admin` is fronted by Cloudflare Access. An unauthenticated request to
`/api/health` gets a `302` to the Access login page before it reaches the
worker, so the smoke runner cannot read the JSON body. The existing
`wrangler-action` exit code in the `deploy` job still proves the admin worker
deployed; we just don't probe it from the public internet. To enable an
active admin check later, issue a Cloudflare Access service token, supply
`CF-Access-Client-Id` + `CF-Access-Client-Secret` headers, and unskip.
