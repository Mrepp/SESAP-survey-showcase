#!/usr/bin/env bash
set -euo pipefail

WORKERS=(admin processing indexing showcase)

echo "Setting up wrangler.toml files from templates..."
echo ""

for worker in "${WORKERS[@]}"; do
  src="workers/$worker/wrangler.example.toml"
  dst="workers/$worker/wrangler.toml"

  if [ -f "$dst" ]; then
    echo "  [skip] $dst already exists"
  elif [ -f "$src" ]; then
    cp "$src" "$dst"
    echo "  [created] $dst from template"
  else
    echo "  [error] Template not found: $src"
  fi
done

echo ""
echo "Done! Now edit each wrangler.toml to fill in your values."
echo "Run 'wrangler kv namespace list' to find your KV namespace IDs."
echo "Run 'wrangler r2 bucket list' to find your R2 bucket name."
