# SESAP Survey Showcase

The SESAP transcription pipeline is a locally run web platform that enables the EECS SESAP team to process and publish oral history interview transcripts. The platform manages the full workflow: ingesting transcripts, running automated LLM analysis, facilitating human review and validation, and deploying an interactive GitHub Pages site where the public can explore interview insights via semantic search, timeline visualizations, thematic breakdowns, and data-backed recommendations.

## Repository Structure

- `data/` – Placeholder directories used during development for raw transcripts, analyzed outputs, and review queues. These remain empty scaffolding until data ingestion is implemented.
- `llm_pipeline/` – Python code for transcript analysis and approval flows. Currently includes the `llm_review` module with a smoke test plus a `requirements-dev.txt` to install linting and test dependencies.
- `generator/` – React static-site generator that will build the GitHub Pages site. Contains a minimal renderer, lint configuration, and a basic smoke test.
- `scripts/` – Utility scripts. `precommit.sh` runs linting and tests across both stacks.
- `.github/workflows/ci.yml` – Continuous integration workflow that mirrors the local pre-commit checks.

## Getting Started

1. **Python environment**
   - `cd llm_pipeline`
   - `python3 -m venv .venv`
   - `.venv/bin/pip install -r requirements-dev.txt`
2. **Node environment**
   - `cd generator`
   - `npm install`

Both environments are required before running linting or tests.

## Contributing

1. Create a feature branch from `main`.
2. Implement your changes in `llm_pipeline`, `generator`, or supporting directories.
3. Run the shared validation script from the repository root:

   ```bash
   ./scripts/precommit.sh
   ```

   This script activates the Python virtualenv, runs `ruff` and `pytest`, ensures Node dependencies are installed, then runs `eslint` and the generator smoke test.
4. Commit your changes along with any updated snapshots or data scaffolding.
5. Open a pull request describing the change and its impact on the SESAP workflow.

The scaffolding directories under `data/` are intentionally left empty in version control—they document the intended pipeline stages and should not be removed.

## Continuous Integration

GitHub Actions automatically validates each push and pull request via `.github/workflows/ci.yml`:

- **Python job** (`llm_pipeline/`):
  - Sets up Python 3.11
  - Installs `requirements-dev.txt`
  - Runs `ruff check .`
  - Executes `pytest`
- **Node job** (`generator/`):
  - Sets up Node 20
  - Runs `npm install`
  - Executes `npm run lint`
  - Runs `npm test`

The workflow must pass before merging changes into `main`. Keeping local runs of `./scripts/precommit.sh` green will reflect CI expectations.

## Next Steps for the Project

- Expand the `llm_pipeline` package to cover ingestion, automated analysis, and reviewer tooling.
- Flesh out the static generator to produce the full experience (search, timelines, themes, recommendations).
- Add integration tests that link Python outputs with generator inputs as modules mature.

Contributors are encouraged to document design decisions and data contracts as new modules come online to preserve the end-to-end workflow clarity described above.
