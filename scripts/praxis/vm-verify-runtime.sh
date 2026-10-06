#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${1:-${PRAXIS_CONTAINER:-}}"
EXPECTED_IMAGE="${2:-${PRAXIS_EXPECTED_IMAGE:-ghcr.io/emilio-01-t/praxis:sha-31754b2}}"
EXPECTED_DIGEST="${PRAXIS_EXPECTED_DIGEST:-sha256:35b887a4cbdda60c25131a55077ea398b19978337093e24779c2caf285d78707}"
HEALTH_URL="${PRAXIS_HEALTH_URL:-}"

if [[ -z "$CONTAINER" ]]; then
  echo "usage: $0 <container-name-or-id> [expected-image]" >&2
  echo "or set PRAXIS_CONTAINER" >&2
  exit 2
fi

command -v docker >/dev/null || { echo "docker is required" >&2; exit 1; }

configured_image="$(docker inspect -f '{{.Config.Image}}' "$CONTAINER")"
image_id="$(docker inspect -f '{{.Image}}' "$CONTAINER")"
running="$(docker inspect -f '{{.State.Running}}' "$CONTAINER")"
status="$(docker inspect -f '{{.State.Status}}' "$CONTAINER")"

printf 'container:         %s\n' "$CONTAINER"
printf 'configured image:  %s\n' "$configured_image"
printf 'image id:          %s\n' "$image_id"
printf 'status:            %s\n' "$status"

if [[ "$running" != "true" ]]; then
  echo "ERROR: container is not running" >&2
  exit 1
fi

if [[ "$configured_image" != "$EXPECTED_IMAGE" && "$configured_image" != "ghcr.io/emilio-01-t/praxis@$EXPECTED_DIGEST" ]]; then
  echo "ERROR: unexpected configured image" >&2
  echo "expected tag:    $EXPECTED_IMAGE" >&2
  echo "expected digest: ghcr.io/emilio-01-t/praxis@$EXPECTED_DIGEST" >&2
  exit 1
fi

repo_digests="$(docker image inspect "$image_id" --format '{{json .RepoDigests}}' 2>/dev/null || true)"
echo "repo digests:       $repo_digests"

if [[ -n "$HEALTH_URL" ]]; then
  command -v curl >/dev/null || { echo "curl required when PRAXIS_HEALTH_URL is set" >&2; exit 1; }
  echo "checking URL:       $HEALTH_URL"
  curl --fail --silent --show-error --max-time 20 "$HEALTH_URL" >/dev/null
  echo "HTTP check:         PASS"
else
  echo "HTTP check:         SKIPPED (set PRAXIS_HEALTH_URL to enable)"
fi

echo "Praxis container runtime verification: PASS"
