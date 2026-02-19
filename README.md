# SESAP Survey Showcase

A monorepo of Cloudflare Workers that powers interview processing, search indexing, and a public showcase UI for SESAP survey data.

## Architecture

```
packages/
  types/        Shared TypeScript type definitions (@sesap/types)
  shared/       Shared utilities & validation   (@sesap/shared)

workers/
  admin/        Admin dashboard + API (Hono + React)   → :8787
  processing/   Interview processing (Cloudflare AI)   → :8788
  indexing/     Search index builder (Lunr, embeddings) → :8789
  showcase/     Public search/display UI (React + Vite) → :8790
```

**Data flow:** Admin receives uploads → Processing runs LLM analysis → Indexing builds search indices → Showcase serves the public UI.

## Prerequisites

- **Node.js 20+**
- **pnpm 10.14+** — `corepack enable` to activate the version pinned in `package.json`
- **Wrangler CLI** — installed as a workspace dependency, no global install needed

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Create wrangler.toml files from templates
make setup

# 3. Fill in your Cloudflare resource IDs
#    Edit each workers/*/wrangler.toml and replace the placeholders.
#    Use these commands to find your IDs:
wrangler kv namespace list       # → KV namespace IDs
wrangler r2 bucket list          # → R2 bucket name

# 4. Start all workers in dev mode
pnpm dev
```

This starts all four workers with hot-reload. Each worker runs on its own port (8787–8790).

To start a single worker:

```bash
pnpm --filter sesap-admin dev       # admin only
pnpm --filter sesap-showcase dev    # showcase only
```

## Available Scripts

Run from the repo root — Turbo handles dependency ordering automatically.

| Command           | What it does                         |
|-------------------|--------------------------------------|
| `pnpm dev`        | Start all workers in dev mode        |
| `pnpm build`      | Build all packages and workers       |
| `pnpm test`       | Run tests across all workspaces      |
| `pnpm typecheck`  | TypeScript validation                |
| `pnpm lint`       | ESLint across all workspaces         |

## Deployment

### Automatic (CI/CD)

Deployments are fully automated via GitHub Actions. **Push your code to the right branch and it deploys.**

| Branch      | Environment | Trigger     |
|-------------|-------------|-------------|
| `staging`  | **Staging** | Push        |
| `main`      | **Production** | Push     |

**Workflow:**

1. Push or merge to `staging` → deploys all 4 workers to **staging**
2. Push or merge to `main` → deploys all 4 workers to **production**
3. PRs to `main` → runs CI (lint, typecheck, test, build) but does **not** deploy

The deploy pipeline ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)):
- Builds shared packages (`@sesap/types`, `@sesap/shared`) first
- Generates `wrangler.toml` from each worker's `wrangler.example.toml` template
- Injects secrets (KV IDs, R2 bucket, API tokens) via environment variables
- Deploys all 4 workers in parallel using `cloudflare/wrangler-action`

### Seeing Live Changes on Staging

```bash
# Make your changes on the staging branch
git checkout staging

# Commit and push
git add -A
git commit -m "your change description"
git push origin staging
```

That's it. GitHub Actions picks up the push, runs CI, and deploys to staging. Check the **Actions** tab in GitHub to monitor progress.

### Manual Deploy

If you need to deploy from your local machine (requires `wrangler login` and filled-in `wrangler.toml` files):

```bash
make deploy             # All workers (in correct dependency order)
make deploy-admin       # Just the admin worker
make deploy-showcase    # Just the showcase worker
```

## GitHub Actions Secrets

These must be configured in your GitHub repo under **Settings → Secrets and variables → Actions**. Set them for both the `staging` and `production` environments.

| Secret                   | Description                        |
|--------------------------|------------------------------------|
| `CLOUDFLARE_API_TOKEN`   | Wrangler API authentication token  |
| `CLOUDFLARE_ACCOUNT_ID`  | Your Cloudflare account ID         |
| `KV_NAMESPACE_ID`        | KV namespace ID for the environment |
| `KV_PREVIEW_ID`          | KV preview namespace ID            |
| `R2_BUCKET_NAME`         | R2 storage bucket name             |

## Project Structure

```
.github/workflows/
  ci.yml              Lint → Test → Build on push & PRs
  deploy.yml          Auto-deploy on push to main / staging

packages/
  types/              TypeScript interfaces shared across workers
  shared/             Zod schemas, logger, vector math, error classes

workers/
  admin/
    src/              Hono API (auth, interviews, monitoring)
    ui/               React admin dashboard (Chakra UI)
  processing/
    src/              Queue consumer, LLM service, transcript parser
    prompts/          LLM prompt templates
  indexing/
    src/              Lunr indexing, vector search, clustering
  showcase/
    src/              Hono static asset server
    ui/               React public UI (Chakra UI, Lunr client-side search)

scripts/
  setup-wrangler.sh   Copies wrangler.example.toml → wrangler.toml

Makefile              Deploy commands with correct dependency ordering
turbo.json            Task graph and caching configuration
pnpm-workspace.yaml   Workspace package definitions
```

## Branching Strategy

- **`main`** — Production. Deploys automatically. Merge PRs here for releases.
- **`staging`** — Staging. Deploys automatically. Push here to test changes live.
- **Feature branches** — Create off `staging`, open PRs back to `main` when ready.
