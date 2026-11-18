#!/usr/bin/env bash
# Start local Postgres + Redis (system installs), then the API and web dev servers in the background.
# Logs go to ./.dev-logs. Use docker compose instead if you prefer: docker compose up -d
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .dev-logs
(service postgresql start || pg_ctlcluster 16 main start) >/dev/null 2>&1 || true
redis-cli ping >/dev/null 2>&1 || redis-server --daemonize yes --save "" >/dev/null
pnpm --filter @mova/api db:migrate >/dev/null
curl -s localhost:4000/api/health >/dev/null 2>&1 || (cd apps/api && setsid nohup pnpm dev > ../../.dev-logs/api.log 2>&1 < /dev/null &)
curl -s -o /dev/null localhost:3000 2>/dev/null || (cd apps/web && setsid nohup pnpm dev > ../../.dev-logs/web.log 2>&1 < /dev/null &)
for i in $(seq 1 60); do curl -s -o /dev/null -w "%{http_code}" localhost:3000/ 2>/dev/null | grep -q 200 && break; sleep 2; done
echo "API: $(curl -s localhost:4000/api/health)"; echo "Web: http://localhost:3000"
