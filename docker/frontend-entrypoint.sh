#!/usr/bin/env bash
set -euo pipefail

# This mode creates no backend processes, persistence or generated credentials.
if [ -f /opt/agent-canvas/defaults.env ]; then
  # shellcheck disable=SC1091
  . /opt/agent-canvas/defaults.env
fi
PORT="${PORT:-${CONFIG_PROXY_PORT:-8000}}"
BASE_PATH="${AGENT_CANVAS_BASE_PATH:-${CONFIG_CANVAS_BASE_PATH:-/canvas}}"
BACKEND_URL="${PRAXIS_BACKEND_URL:-}"
ROUTE_ARGS=()
for prefix in /api /server_info /sockets /alive /health /ready /docs /redoc /openapi.json; do
  if [ -n "$BACKEND_URL" ]; then
    ROUTE_ARGS+=(--route "$prefix=$BACKEND_URL")
  else
    ROUTE_ARGS+=(--reject-prefix "$prefix")
  fi
done
if [ -n "$BACKEND_URL" ]; then
  node --input-type=module - "$BACKEND_URL" <<'JS'
const url = new URL(process.argv[2]);
if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
    url.search || url.hash || url.pathname !== '/') {
  throw new Error('PRAXIS_BACKEND_URL must be an HTTP(S) origin without credentials');
}
JS
fi
EDITOR_ARGS=()
if [ -n "${PRAXIS_EDITOR_PATH:-}" ]; then
  node --input-type=module - "$PRAXIS_EDITOR_PATH" "$BASE_PATH" "$BACKEND_URL" <<'JS'
const [editor, canvas, backend] = process.argv.slice(2);
const reserved = [canvas.replace(/\/$/, ""), "/api", "/server_info", "/sockets", "/alive", "/health", "/ready", "/docs", "/redoc", "/openapi.json"];
if (!backend || !/^\/[a-zA-Z0-9_-]+$/.test(editor) || reserved.includes(editor)) {
  throw new Error("PRAXIS_EDITOR_PATH requires a backend and a non-reserved single-segment path");
}
JS
  EDITOR_ARGS=(--route "$PRAXIS_EDITOR_PATH=$BACKEND_URL" --vscode-base-path "$PRAXIS_EDITOR_PATH" --no-referrer-prefix "$PRAXIS_EDITOR_PATH")
fi
AUTH_ARGS=()
if [ -n "$BACKEND_URL" ]; then AUTH_ARGS+=(--auth-required); fi
exec node /opt/agent-canvas/static-server.mjs \
  --port "$PORT" --host :: --base-path "$BASE_PATH" \
  --dir /opt/agent-canvas/frontend "${AUTH_ARGS[@]}" "${ROUTE_ARGS[@]}" "${EDITOR_ARGS[@]}"
