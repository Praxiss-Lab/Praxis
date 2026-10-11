#!/usr/bin/env bash
set -euo pipefail

HOST="${PRAXIS_SMOKE_HOST:-127.0.0.1}"
PORT="${PRAXIS_SMOKE_PORT:-18777}"
LOG_FILE="${PRAXIS_SMOKE_LOG:-/tmp/praxis-smoke.log}"

if [ ! -f build/index.html ]; then
  echo "error: build/index.html is missing; run npm run build first" >&2
  exit 1
fi

cleanup() {
  if [ -n "${pid:-}" ] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

node bin/agent-canvas.mjs --frontend-only --host "$HOST" --port "$PORT" >"$LOG_FILE" 2>&1 &
pid=$!

url="http://$HOST:$PORT/"

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error "$url" -o /tmp/praxis-smoke-index.html; then
    break
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "error: Praxis frontend process exited before becoming ready" >&2
    cat "$LOG_FILE" >&2 || true
    exit 1
  fi
  sleep 1
done

curl --fail --silent --show-error "$url" -o /tmp/praxis-smoke-index.html

if ! grep -qi '<html' /tmp/praxis-smoke-index.html; then
  echo "error: smoke response did not look like HTML" >&2
  cat /tmp/praxis-smoke-index.html >&2 || true
  exit 1
fi

if ! kill -0 "$pid" 2>/dev/null; then
  echo "error: Praxis frontend process is not alive after serving the smoke request" >&2
  cat "$LOG_FILE" >&2 || true
  exit 1
fi

echo "Praxis frontend smoke test PASSED at $url"
