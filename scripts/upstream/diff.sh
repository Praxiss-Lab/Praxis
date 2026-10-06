#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-main}"
UPSTREAM_REF="${2:-upstream/main}"

git rev-parse --verify "$BASE_REF" >/dev/null
git rev-parse --verify "$UPSTREAM_REF" >/dev/null

echo "=== Commits only on each side ==="
git --no-pager log --oneline --left-right --graph "$BASE_REF...$UPSTREAM_REF"

echo
echo "=== File summary ==="
git --no-pager diff --stat "$BASE_REF..$UPSTREAM_REF"
