# Testing

From a configured checkout, use the root scripts in [`package.json`](../package.json). The local gates are `pnpm typecheck`, `pnpm lint`, and the affected worker's `pnpm --filter sesap-<worker> test`. `pnpm test` runs the Turbo workspace test graph, which includes suites with external or live prerequisites; it is not a single offline gate.

| Check | What it establishes | Prerequisite |
| --- | --- | --- |
| Typecheck and lint | Static and style checks across workspaces | Installed dependencies |
| Worker unit tests | Route and service behavior under mocks | Installed dependencies |
| [`tests/e2e`](../tests/e2e) | Local cross worker flows, including intake specs | Local stack and suite configuration |
| [Smoke](../tests/smoke/README.md) | Read only live health and public asset checks | Deployed URLs, including intake |
| [Full pipeline](../tests/full-pipeline/README.md) | Admin Kaltura through real transcription, analysis, build, and showcase | Kaltura, Cloudflare AI, local stack, browser |

Run smoke with staging URLs after a staging deployment. It checks intake health and page delivery, but it does not submit a recording or prove email delivery. Admin is skipped when its Access protected URL is not supplied. The full pipeline suite does not cover contributor self intake. For a human review of that path, use [partner verification](partner-verification.md) with test material. CI checks and deployment triggers are described in [deployment](deployment.md); suite READMEs own detailed setup and limits.
