#!/usr/bin/env bash
set -euo pipefail

STATE_DIR="${PRAXIS_DEPLOY_STATE_DIR:-/var/lib/praxis-deployments}"
STATE_FILE="${1:-}"

if [[ -z "$STATE_FILE" ]]; then
  STATE_FILE="$(ls -1t "$STATE_DIR"/deploy-*.env 2>/dev/null | head -n 1 || true)"
fi

if [[ -z "$STATE_FILE" || ! -f "$STATE_FILE" ]]; then
  echo "error: no deployment state record found" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$STATE_FILE"

SERVICE="${SERVICE:-agent-canvas}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
override_file="$STATE_DIR/active.override.yml"

rollback_image=""
if [[ -n "${OLD_REPO_DIGEST:-}" ]]; then
  rollback_image="$OLD_REPO_DIGEST"
elif [[ -n "${OLD_IMAGE_ID:-}" ]]; then
  rollback_image="$OLD_IMAGE_ID"
elif [[ -n "${OLD_IMAGE_REF:-}" ]]; then
  rollback_image="$OLD_IMAGE_REF"
else
  echo "error: deployment state has no previous image" >&2
  exit 1
fi

cd "$COMPOSE_DIR"

if [[ "$rollback_image" == *@sha256:* || "$rollback_image" == *:* ]]; then
  docker pull "$rollback_image" >/dev/null 2>&1 || true
fi

cat > "$override_file" <<EOF
services:
  $SERVICE:
    image: $rollback_image
EOF
chmod 600 "$override_file"

docker compose \
  -f "$COMPOSE_FILE" \
  -f "$override_file" \
  up -d --no-deps --force-recreate "$SERVICE"

container="$(docker compose -f "$COMPOSE_FILE" -f "$override_file" ps -q "$SERVICE")"
if [[ -z "$container" ]]; then
  echo "error: rollback did not produce a running container" >&2
  exit 1
fi

running_ref="$(docker inspect --format '{{.Config.Image}}' "$container")"
running_id="$(docker inspect --format '{{.Image}}' "$container")"

echo "Praxis rollback completed."
echo "state record:  $STATE_FILE"
echo "rollback image: $rollback_image"
echo "running ref:    $running_ref"
echo "running id:     $running_id"
echo
echo "Run scripts/praxis/target-smoke.sh to verify the rollback."
