#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
MODE=full
case "${1:-}" in
  '') ;;
  --frontend-only) MODE=frontend ;;
  *) echo "Usage: bash .openhands/setup.sh [--frontend-only]" >&2; exit 1 ;;
esac
if [ "$#" -gt 1 ]; then echo "error: unexpected arguments" >&2; exit 1; fi
for tool in node npm; do
  command -v "$tool" >/dev/null || { echo "error: $tool is required" >&2; exit 1; }
done
node_version="$(node --version)"
node_major="${node_version#v}"
node_major="${node_major%%.*}"
if [[ ! "$node_major" =~ ^[0-9]+$ ]] || [ "$node_major" -lt 24 ]; then
  echo "error: Node.js 24 or newer is required" >&2; exit 1
fi
if [ "$MODE" = full ] && ! command -v uvx >/dev/null; then
  echo "error: uvx is required for the backend. Install uv explicitly (https://docs.astral.sh/uv/getting-started/installation/), or use --frontend-only." >&2
  exit 1
fi
if [ -L .env ] || [ -L .env.sample ]; then
  echo "error: refusing an env symlink outside the setup boundary" >&2; exit 1
fi
npm ci
if [ ! -f .env ]; then cp .env.sample .env; fi
if ! grep -Eq '^[[:space:]]*(export[[:space:]]+)?VITE_WORKING_DIR=' .env; then
  workspace="$(node -p 'JSON.stringify(process.cwd())')"
  printf '\nVITE_WORKING_DIR=%s\n' "$workspace" >> .env
fi
npm run make-i18n
echo "Praxis $MODE development setup complete. No services were started."
