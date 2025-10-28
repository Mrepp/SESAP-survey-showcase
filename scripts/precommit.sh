#!/usr/bin/env bash
set -euo pipefail

# Run project linting and tests prior to committing changes.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY_ENV="$ROOT_DIR/llm_pipeline/.venv"

echo "==> Python: activating virtual environment"
if [[ ! -d "$PY_ENV" ]]; then
  echo "Python virtualenv not found at $PY_ENV. Run 'python3 -m venv llm_pipeline/.venv' first." >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$PY_ENV/bin/activate"

echo "==> Python: ruff lint"
(cd "$ROOT_DIR/llm_pipeline" && ruff check .)

echo "==> Python: pytest"
(cd "$ROOT_DIR/llm_pipeline" && pytest)

deactivate 2>/dev/null || true

echo "==> Node: ensuring dependencies"
if [[ ! -d "$ROOT_DIR/generator/node_modules" ]]; then
  (cd "$ROOT_DIR/generator" && npm install)
fi

echo "==> Node: eslint"
(cd "$ROOT_DIR/generator" && npm run lint)

echo "==> Node: tests"
(cd "$ROOT_DIR/generator" && npm test)

echo "All checks passed."
