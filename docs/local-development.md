# Local development

Use Node 22, the pnpm version pinned in [`package.json`](../package.json), `make`, and `openssl`. Wrangler is installed by the workspace. From the repository root:

```sh
pnpm install
make setup
make dev
```

`make setup` copies the five `workers/*/wrangler.example.toml` templates to ignored local `wrangler.toml` files, fills local R2/KV stub identifiers, sets intake URLs and sender to local values, and creates an ignored `workers/intake/.dev.vars` with a random session secret. It preserves existing local files and real IDs. Inspect any older `workers/intake/.dev.vars`: comment out `DEV_MAIL_URL` if Mailpit is not running. Never deploy a generated config with the `WRANGLER_STUB_DO_NOT_DEPLOY` sentinel. The [setup script](../scripts/setup-wrangler.sh) is authoritative for the generated values.

`make dev` builds the admin and intake static exports and starts the five workers plus their Next development servers. Open showcase at `http://localhost:3100`, admin at `http://localhost:3101`, and intake at `http://localhost:3102`. Their worker APIs run on ports 8890, 8887, and 8891 respectively; processing and indexing use 8888 and 8889. Stop with Ctrl-C or `make dev-down`. The Makefile is the authority for ports and process commands.

Local Wrangler uses simulated R2 and KV under `.wrangler/dev-state`. Intake verification email is logged locally when `DEV_MAIL_URL` is unset. To see messages in a local Mailpit instance, start it separately and set `DEV_MAIL_URL` in `workers/intake/.dev.vars` as shown by [its example](../workers/intake/.dev.vars.example). This repository has no Mailpit compose file. Turnstile is skipped locally unless both local test keys are set. The five `wrangler.example.toml` files own worker bindings and environment variables; do not put production credentials in local examples.

The regular local path does not prove real email delivery, Cloudflare Access, Workers AI, or a public domain. The [full pipeline suite](../tests/full-pipeline/README.md) explains the separate real Kaltura and AI prerequisites. Fixture data design is in the [fixture package guide](../packages/dev-fixtures/README.md); the ordinary `make dev` command does not seed a public build. If the showcase is empty, create and approve a test interview in admin, then run its build action.

If a worker fails to start, check that `make setup` created all five configs, the intake session secret exists, ports are free, and dependencies installed successfully. If an intake verification message is missing, read the worker log or check that the configured Mailpit instance is reachable. See [testing](testing.md) for the local checks and [deployment](deployment.md) for staging configuration.
