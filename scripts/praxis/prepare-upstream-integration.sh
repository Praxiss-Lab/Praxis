#!/usr/bin/env bash
set -euo pipefail

LABEL="${1:-$(date +%Y-%m-%d)}"
BRANCH="integration/upstream-$LABEL"

if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree must be clean" >&2
  exit 1
fi

git switch main
git pull --ff-only origin main

if ! git remote get-url upstream >/dev/null 2>&1; then
  git remote add upstream https://github.com/OpenHands/OpenHands.git
fi

git fetch --prune upstream

git switch -c "$BRANCH"

echo "Created $BRANCH"
echo "No upstream commits have been merged."
echo "Review first with:"
echo "  scripts/praxis/upstream-report.sh main upstream/main"
