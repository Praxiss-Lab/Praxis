#!/usr/bin/env bash
set -euo pipefail

COMPOSE_DIR="${PRAXIS_COMPOSE_DIR:-}"
SERVICE="${PRAXIS_COMPOSE_SERVICE:-agent-canvas}"
COMPOSE_FILE="${PRAXIS_COMPOSE_FILE:-docker-compose.yml}"
STATE_DIR="${PRAXIS_DEPLOY_STATE_DIR:-/var/lib/praxis-deployments}"
BASE_URL="${PRAXIS_SMOKE_URL:-http://127.0.0.1:8000/canvas}"

if [[ -z "$COMPOSE_DIR" ]]; then
  echo "error: set PRAXIS_COMPOSE_DIR" >&2
  exit 2
fi

cd "$COMPOSE_DIR"
override_file="$STATE_DIR/active.override.yml"

compose_args=(-f "$COMPOSE_FILE")
if [[ -f "$override_file" ]]; then
  compose_args+=(-f "$override_file")
fi

container="$(docker compose "${compose_args[@]}" ps -q "$SERVICE")"
if [[ -z "$container" ]]; then
  echo "error: no container found for service '$SERVICE'" >&2
  exit 1
fi

running="$(docker inspect --format '{{.State.Running}}' "$container")"
health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container")"
image_ref="$(docker inspect --format '{{.Config.Image}}' "$container")"
image_id="$(docker inspect --format '{{.Image}}' "$container")"

if [[ "$running" != "true" ]]; then
  echo "error: service container is not running" >&2
  exit 1
fi

echo "container running: true"
echo "container health:  $health"
echo "image ref:         $image_ref"
echo "image id:          $image_id"

status="$(curl -k -L -sS -o /tmp/praxis-smoke-body.$$ -w '%{http_code}' --max-time 20 "$BASE_URL" || true)"
trap 'rm -f /tmp/praxis-smoke-body.$$' EXIT

if [[ ! "$status" =~ ^(200|301|302|307|308|401|403)$ ]]; then
  echo "error: unexpected HTTP status from $BASE_URL: $status" >&2
  exit 1
fi

echo "HTTP smoke:        $status from $BASE_URL"
echo "TARGET_SMOKE=PASS"
