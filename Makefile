.PHONY: dev deploy deploy-admin deploy-processing deploy-showcase deploy-indexing setup help

help:
	@echo "Available targets:"
	@echo "  make dev                 - Run admin (8787) and showcase (8790) locally"
	@echo "  make deploy              - Deploy all workers (in correct order)"
	@echo "  make deploy-admin        - Deploy admin worker (requires processing & indexing)"
	@echo "  make deploy-processing   - Deploy processing worker"
	@echo "  make deploy-showcase     - Deploy showcase worker"
	@echo "  make deploy-indexing     - Deploy indexing worker"
	@echo "  make setup              - Create wrangler.toml files from templates"

dev:
	pnpm dev

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
