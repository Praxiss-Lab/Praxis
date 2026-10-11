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
git check-ref-format --branch "$BRANCH" >/dev/null
if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree must be clean" >&2
  exit 1
fi
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "error: branch $BRANCH already exists; resume it or use a different label" >&2
  exit 1
fi
bash "$ROOT/scripts/praxis/upstream-fetch.sh"
git fetch origin '+refs/heads/main:refs/remotes/origin/main'
BASE="$(git rev-parse origin/main)"
TARGET="$(git rev-parse upstream/main)"
LAST_REVIEWED="$(git show "$BASE:docs/upstream/LAST_REVIEWED")"
REPORT="$(bash "$ROOT/scripts/praxis/upstream-report.sh" "$LAST_REVIEWED" "$TARGET" "$BASE")"
git switch -c "$BRANCH" "$BASE"
REVIEW="docs/upstream/reviews/$LABEL.md"
mkdir -p docs/upstream/reviews
cat > "$REVIEW" <<EOF
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
echo "Created $BRANCH from origin/main; local main was not changed."
echo "No upstream commits have been merged. Review snapshot: $REVIEW"
echo "Frozen upstream target: $TARGET"
