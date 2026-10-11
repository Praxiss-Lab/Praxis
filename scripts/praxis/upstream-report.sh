#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
BASE_REF="${1:-$(cat "$ROOT/docs/upstream/LAST_REVIEWED")}"
UPSTREAM_REF="${2:-upstream/main}"
PRAXIS_REF="${3:-HEAD}"
for ref in "$BASE_REF" "$UPSTREAM_REF" "$PRAXIS_REF"; do
  git rev-parse --verify "$ref^{commit}" >/dev/null
done
if ! git merge-base --is-ancestor "$BASE_REF" "$UPSTREAM_REF"; then
  echo "error: last reviewed commit is not an ancestor of the upstream target; review history before continuing" >&2
  exit 1
fi

echo "Last reviewed: $(git rev-parse "$BASE_REF")"
echo "Upstream target: $(git rev-parse "$UPSTREAM_REF")"
echo "Praxis base: $(git rev-parse "$PRAXIS_REF")"
echo
echo "Upstream commits since the last completed review (may include already cherry-picked changes):"
git --no-pager log --reverse --oneline "$BASE_REF..$UPSTREAM_REF"
echo
echo "Files changed upstream in that interval:"
git --no-pager diff --name-status "$BASE_REF" "$UPSTREAM_REF"
echo
echo "Patch-equivalent upstream commits relative to Praxis (- already present, + not found):"
git cherry "$PRAXIS_REF" "$UPSTREAM_REF" "$BASE_REF"
