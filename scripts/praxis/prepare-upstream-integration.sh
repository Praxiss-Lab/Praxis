#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
LABEL="${1:-$(date -u +%Y-%m-%d)}"
if [[ ! "$LABEL" =~ ^[a-zA-Z0-9][a-zA-Z0-9._-]*$ ]]; then
  echo "error: review label must contain only letters, numbers, dots, underscores or hyphens" >&2
  exit 1
fi
cd "$ROOT"
BRANCH="integration/upstream-$LABEL"
REVIEW_BRANCH="upstream-review/$LABEL"
git check-ref-format --branch "$BRANCH" >/dev/null
if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree must be clean" >&2
  exit 1
fi
for existing in "$BRANCH" "$REVIEW_BRANCH"; do
  if git show-ref --verify --quiet "refs/heads/$existing"; then
    echo "error: branch $existing already exists; resume it or use a different label" >&2
    exit 1
  fi
done
bash "$ROOT/scripts/praxis/upstream-fetch.sh"
git fetch origin '+refs/heads/main:refs/remotes/origin/main' \
  '+refs/heads/documentation:refs/remotes/origin/documentation'
BASE="$(git rev-parse origin/main)"
DOCS_BASE="$(git rev-parse origin/documentation)"
TARGET="$(git rev-parse upstream/main)"
# Upstream review records live on the documentation branch, not on main.
LAST_REVIEWED="$(git show "$DOCS_BASE:docs/upstream/LAST_REVIEWED")"
REPORT="$(bash "$ROOT/scripts/praxis/upstream-report.sh" "$LAST_REVIEWED" "$TARGET" "$BASE")"
REVIEW="docs/upstream/reviews/$LABEL.md"
REVIEW_TEXT="$(cat <<EOF
# Upstream review: $LABEL

- Status: PREPARED (not reviewed or integrated)
- Praxis base: \`$BASE\`
- Last reviewed upstream commit: \`$LAST_REVIEWED\`
- Frozen upstream target: \`$TARGET\`
- Integration branch: \`$BRANCH\`

## Report

\`\`\`text
$REPORT
\`\`\`

## Decisions

Record ACCEPT / PARTIAL / REJECT / DEFER for each commit or coherent group.
For partial integrations, record selected paths or patches and resulting Praxis commits.
Deferred work must retain its source SHA so it can be revisited after the checkpoint advances.

## Verification

Record automatic checks, manual tests, unresolved conflicts and compatibility risks.

## Maintainer decision

Pending. No upstream code has been integrated and no merge into main is authorized by this file.
EOF
)"
# Commit the snapshot onto a review branch from documentation without
# touching the working tree.
INDEX="$(mktemp)"
trap 'rm -f "$INDEX"' EXIT
GIT_INDEX_FILE="$INDEX" git read-tree "$DOCS_BASE"
BLOB="$(printf '%s\n' "$REVIEW_TEXT" | git hash-object -w --stdin)"
GIT_INDEX_FILE="$INDEX" git update-index --add --cacheinfo 100644 "$BLOB" "$REVIEW"
TREE="$(GIT_INDEX_FILE="$INDEX" git write-tree)"
REVIEW_COMMIT="$(git commit-tree "$TREE" -p "$DOCS_BASE" -m "Prepare upstream review $LABEL")"
git branch "$REVIEW_BRANCH" "$REVIEW_COMMIT"
git switch -c "$BRANCH" "$BASE"
echo "Created $BRANCH from origin/main; local main was not changed."
echo "No upstream commits have been merged. Review snapshot: $REVIEW on $REVIEW_BRANCH"
echo "Open a pull request from $REVIEW_BRANCH into documentation to record the review."
echo "Frozen upstream target: $TARGET"
