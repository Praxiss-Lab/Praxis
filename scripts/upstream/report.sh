#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-main}"
UPSTREAM_REF="${2:-upstream/main}"

base_sha="$(git rev-parse "$BASE_REF")"
upstream_sha="$(git rev-parse "$UPSTREAM_REF")"
merge_base="$(git merge-base "$BASE_REF" "$UPSTREAM_REF")"

cat <<REPORT
Praxis upstream report

Praxis ref:      $BASE_REF
Praxis SHA:      $base_sha
Upstream ref:    $UPSTREAM_REF
Upstream SHA:    $upstream_sha
Merge base:      $merge_base

New upstream commits since merge-base:
REPORT

git --no-pager log --oneline "$merge_base..$UPSTREAM_REF"

echo
echo "Praxis-only commits since merge-base:"
git --no-pager log --oneline "$merge_base..$BASE_REF"
