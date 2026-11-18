#!/usr/bin/env bash
# Browser tests for MOVA. Starts the API and website (via the webapp-testing helper) unless they are already up.
#   e2e/run.sh               run everything
#   e2e/run.sh -k booking    run a subset
set -euo pipefail
cd "$(dirname "$0")"
if curl -s -o /dev/null http://localhost:3000 && curl -s -o /dev/null http://localhost:4000/api/health; then
  exec python3 -m pytest -q "$@"
fi
exec python3 with_server.py --timeout 180 \
  --server "cd ../apps/api && pnpm dev" --port 4000 \
  --server "cd ../apps/web && pnpm dev" --port 3000 \
  -- python3 -m pytest -q "$@"
