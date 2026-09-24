.PHONY: dev dev-down dev-ui ui-build deploy deploy-admin deploy-processing deploy-showcase deploy-indexing setup test-pipeline-headed help

help:
	@echo "Available targets:"
	@echo "  make dev                 - Build admin UI bundle and run all workers + showcase next dev locally"
	@echo "  make dev-down            - Stop only the local servers started by make dev"
	@echo "  make dev-ui              - Run admin UI Vite dev server with HMR (proxies /api to :8887)"
	@echo "  make ui-build            - Build admin UI bundle into workers/admin/public/"
	@echo "  make deploy              - Deploy all workers (in correct order)"
	@echo "  make deploy-admin        - Deploy admin worker (requires processing & indexing)"
	@echo "  make deploy-processing   - Deploy processing worker"
	@echo "  make deploy-showcase     - Deploy showcase worker"
	@echo "  make deploy-indexing     - Deploy indexing worker"
	@echo "  make setup               - Create wrangler.toml files from templates"
	@echo "  make test-pipeline-headed - Start the dev stack and run the full-pipeline e2e test with a visible browser"

dev: dev-down
	@sh -c '\
	  pinned_urls=0; \
	  if [ -t 1 ]; then \
	    rows=$$(tput lines 2>/dev/null || printf 24); \
	    printf "\\033[2J\\033[H\\033[1;4r\\033[1;1HLocal development URLs:\\n  Ingestion: http://localhost:3102\\n  Admin:     http://localhost:3101\\n  Showcase:  http://localhost:3100\\n\\n\\033[5;1H"; \
	    pinned_urls=1; \
	  else \
	    printf "\\nLocal development URLs:\\n  Ingestion: http://localhost:3102\\n  Admin:     http://localhost:3101\\n  Showcase:  http://localhost:3100\\n\\n"; \
	  fi; \
	  pid_file=".wrangler/dev.pids"; \
	  mkdir -p .wrangler; : > "$$pid_file"; \
	  cleanup() { while IFS= read -r pid; do kill -TERM "$$pid" 2>/dev/null || true; done < "$$pid_file"; rm -f "$$pid_file"; [ "$$pinned_urls" -eq 0 ] || printf "\\033[r\\033[%s;1H" "$$rows"; }; \
	  trap cleanup EXIT INT TERM; \
	  start() { "$$@" & printf "%s\\n" "$$!" >> "$$pid_file"; }; \
	  make ui-build || exit $$?; \
	  start node ./node_modules/wrangler/bin/wrangler.js dev --persist-to ./.wrangler/dev-state -c workers/admin/wrangler.toml -c workers/processing/wrangler.toml -c workers/indexing/wrangler.toml; \
	  start node ./node_modules/wrangler/bin/wrangler.js dev --persist-to ./.wrangler/dev-state -c workers/showcase/wrangler.toml; \
	  start node ./node_modules/wrangler/bin/wrangler.js dev --persist-to ./.wrangler/dev-state -c workers/intake/wrangler.toml; \
	  start sh -c "cd workers/admin/ui && exec node ./node_modules/next/dist/bin/next dev --webpack -p 3101"; \
	  start sh -c "cd workers/showcase/ui && exec node ./node_modules/next/dist/bin/next dev --webpack -p 3100"; \
	  start sh -c "cd workers/intake/ui && exec node ./node_modules/next/dist/bin/next dev --webpack -p 3102"; \
	  wait'

dev-down:
	@sh -c '\
	  pid_file=".wrangler/dev.pids"; \
	  [ -f "$$pid_file" ] || { echo "No make dev PID file found."; exit 0; }; \
	  while IFS= read -r pid; do \
	    if kill -0 "$$pid" 2>/dev/null; then echo "Stopping make dev process $$pid"; kill -TERM "$$pid"; fi; \
	  done < "$$pid_file"; \
	  rm -f "$$pid_file"'

dev-ui:
	pnpm --filter sesap-admin dev:ui

ui-build:
	@echo "🛠  Rebuilding admin UI bundle..."
	@cd workers/admin/ui && node ./node_modules/next/dist/bin/next build && rm -rf ../public && cp -r out ../public && cp -r public/. ../public/ 2>/dev/null || true
	@echo "🛠  Rebuilding intake UI bundle..."
	@cd workers/intake/ui && node ./node_modules/next/dist/bin/next build && rm -rf ../public && cp -r out ../public && cp -r public/. ../public/ 2>/dev/null || true

# Deploy in dependency order: processing and indexing first, then admin and showcase
deploy: deploy-processing deploy-indexing deploy-admin deploy-showcase
	@echo "✅ All workers deployed successfully!"

# Admin depends on processing and indexing workers
deploy-admin: deploy-processing deploy-indexing
	@echo "🚀 Deploying admin worker..."
	@cd workers/admin && pnpm run deploy

deploy-processing:
	@echo "🚀 Deploying processing worker..."
	@cd workers/processing && pnpm run deploy

deploy-showcase:
	@echo "🚀 Deploying showcase worker..."
	@cd workers/showcase && pnpm run deploy

deploy-indexing:
	@echo "🚀 Deploying indexing worker..."
	@cd workers/indexing && pnpm run deploy

setup:
	@bash scripts/setup-wrangler.sh

test-pipeline-headed:
	@pnpm --filter @sesap/full-pipeline exec playwright test --headed
