#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-main}"
UPSTREAM_REF="${2:-upstream/main}"

git rev-parse --verify "$BASE_REF" >/dev/null
git rev-parse --verify "$UPSTREAM_REF" >/dev/null

merge_base="$(git merge-base "$BASE_REF" "$UPSTREAM_REF")"

echo "Praxis base:      $BASE_REF ($(git rev-parse --short "$BASE_REF"))"
echo "Upstream ref:     $UPSTREAM_REF ($(git rev-parse --short "$UPSTREAM_REF"))"
echo "Common ancestor:  $(git rev-parse --short "$merge_base")"
echo
echo "Commits upstream has that Praxis does not:"
git --no-pager log --oneline "$BASE_REF..$UPSTREAM_REF"
echo
echo "Commits Praxis has that upstream does not:"
git --no-pager log --oneline "$UPSTREAM_REF..$BASE_REF"
echo
echo "Changed files across divergence:"
git --no-pager diff --name-status "$BASE_REF...$UPSTREAM_REF"
