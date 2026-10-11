#!/usr/bin/env bash
set -euo pipefail

UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/OpenHands/OpenHands.git}"
git rev-parse --is-inside-work-tree >/dev/null
if [ "$(git rev-parse --is-shallow-repository)" = true ]; then
  echo "error: upstream review requires full history; run git fetch --unshallow origin first" >&2
  exit 1
fi
if git remote get-url upstream >/dev/null 2>&1; then
  current="$(git remote get-url upstream)"
  if [ "$current" != "$UPSTREAM_URL" ]; then
    echo "error: upstream remote points to $current, expected $UPSTREAM_URL" >&2
    exit 1
  fi
else
  git remote add upstream "$UPSTREAM_URL"
fi

git fetch --prune upstream '+refs/heads/main:refs/remotes/upstream/main'
echo "Fetched upstream: $UPSTREAM_URL"
echo "Praxis HEAD:   $(git rev-parse --short HEAD)"
echo "Upstream main: $(git rev-parse --short upstream/main)"
