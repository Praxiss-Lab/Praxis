#!/usr/bin/env bash
set -euo pipefail

TARGET_IMAGE="${1:-}"
COMPOSE_DIR="${PRAXIS_COMPOSE_DIR:-}"
SERVICE="${PRAXIS_COMPOSE_SERVICE:-agent-canvas}"
COMPOSE_FILE="${PRAXIS_COMPOSE_FILE:-docker-compose.yml}"
STATE_DIR="${PRAXIS_DEPLOY_STATE_DIR:-/var/lib/praxis-deployments}"

if [[ -z "$TARGET_IMAGE" ]]; then
  echo "usage: $0 ghcr.io/praxiss-lab/praxis:sha-<commit>" >&2
  exit 2
fi

if [[ "$TARGET_IMAGE" != ghcr.io/praxiss-lab/praxis:sha-* && "$TARGET_IMAGE" != ghcr.io/praxiss-lab/praxis@sha256:* ]]; then
  echo "error: Deployment requires an immutable Praxis sha tag or digest" >&2
  exit 2
fi

if [[ -z "$COMPOSE_DIR" ]]; then
  echo "error: set PRAXIS_COMPOSE_DIR to the target Compose directory" >&2
  exit 2
fi

cd "$COMPOSE_DIR"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "error: Compose file not found: $COMPOSE_DIR/$COMPOSE_FILE" >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" config --services | grep -Fxq "$SERVICE"; then
  echo "error: service '$SERVICE' not found in $COMPOSE_FILE" >&2
  exit 1
fi

mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
state_file="$STATE_DIR/deploy-$timestamp.env"
override_file="$STATE_DIR/active.override.yml"

current_container="$(docker compose -f "$COMPOSE_FILE" ps -q "$SERVICE" || true)"
old_image_ref=""
old_image_id=""
old_repo_digest=""

if [[ -n "$current_container" ]]; then
  old_image_ref="$(docker inspect --format '{{.Config.Image}}' "$current_container")"
  old_image_id="$(docker inspect --format '{{.Image}}' "$current_container")"
  old_repo_digest="$(docker image inspect "$old_image_id" --format '{{index .RepoDigests 0}}' 2>/dev/null || true)"
fi

printf 'OLD_IMAGE_REF=%q\n' "$old_image_ref" > "$state_file"
printf 'OLD_IMAGE_ID=%q\n' "$old_image_id" >> "$state_file"
printf 'OLD_REPO_DIGEST=%q\n' "$old_repo_digest" >> "$state_file"
printf 'TARGET_IMAGE=%q\n' "$TARGET_IMAGE" >> "$state_file"
printf 'SERVICE=%q\n' "$SERVICE" >> "$state_file"
printf 'COMPOSE_DIR=%q\n' "$COMPOSE_DIR" >> "$state_file"
printf 'COMPOSE_FILE=%q\n' "$COMPOSE_FILE" >> "$state_file"
chmod 600 "$state_file"

cat > "$override_file" <<EOF
services:
  $SERVICE:
    image: $TARGET_IMAGE
EOF
chmod 600 "$override_file"

echo "Pulling $TARGET_IMAGE"
docker pull "$TARGET_IMAGE"

echo "Recreating only service '$SERVICE'"
docker compose \
  -f "$COMPOSE_FILE" \
  -f "$override_file" \
  up -d --no-deps --force-recreate "$SERVICE"

new_container="$(docker compose -f "$COMPOSE_FILE" -f "$override_file" ps -q "$SERVICE")"
if [[ -z "$new_container" ]]; then
  echo "error: service did not produce a running container" >&2
  exit 1
fi

running_ref="$(docker inspect --format '{{.Config.Image}}' "$new_container")"
running_id="$(docker inspect --format '{{.Image}}' "$new_container")"

if [[ "$running_ref" != "$TARGET_IMAGE" ]]; then
  echo "error: running container uses '$running_ref', expected '$TARGET_IMAGE'" >&2
  exit 1
fi

echo
echo "Praxis deployment completed."
echo "service:        $SERVICE"
echo "target image:   $TARGET_IMAGE"
echo "running image:  $running_ref"
echo "image id:       $running_id"
echo "state record:   $state_file"
echo "override file:  $override_file"
echo
echo "Next: run scripts/praxis/target-smoke.sh from the Praxis checkout."
