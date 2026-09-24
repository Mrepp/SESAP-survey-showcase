# SESAP Survey Showcase

This repository contains the public SESAP story showcase, contributor intake, staff review tools, and the processing and indexing workers. The five worker journey is contributor submission → staff media review → processing → contributor draft review → staff approval → public build. See [architecture](docs/architecture.md) for the data flow and boundaries.

This `self-service-intake` branch adds intake deployment and smoke wiring, but it has not been deployed or verified on staging. Contributor consent is still [draft](packages/core/src/consent/consent-text.ts); the public domain, sending domain, and OSU Library transfer route need partner decisions. Use test material only. The [launch roadmap](docs/roadmap.md) tracks those gates.

Start with [local development](docs/local-development.md). Use [testing](docs/testing.md) to choose checks and [deployment](docs/deployment.md) for the branch and release path. SESAP staff can use [operations](docs/operations.md); the partner staging review is in [partner verification](docs/partner-verification.md).
