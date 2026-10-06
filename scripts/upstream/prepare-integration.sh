#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <identifier>" >&2
  echo "example: $0 1.26.0" >&2
  exit 2
fi

identifier="$1"
branch="integration/upstream-$identifier"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: working tree must be clean" >&2
  exit 1
fi

"$(dirname "$0")/fetch.sh"

git switch main
git pull --ff-only origin main
git switch -c "$branch"

echo "Created $branch from current Praxis main."
echo "Review upstream/main and integrate deliberately; this script does not merge anything."
