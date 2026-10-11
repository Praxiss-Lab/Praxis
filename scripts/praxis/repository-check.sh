#!/usr/bin/env bash
set -euo pipefail

fail=0

require_file() {
  if [ ! -f "$1" ]; then
    echo "MISSING: $1" >&2
    fail=1
  else
    echo "OK: $1"
  fi
}

require_file LICENSE
require_file NOTICE
require_file PRAXIS_VERSION
require_file docs/upstream/BASELINE.md
require_file docs/upstream/SYNC_LOG.md
require_file docs/policies/VERSIONING.md
require_file docs/policies/RELEASE.md
require_file docs/distribution/README.md
require_file .github/workflows/praxis-ci.yml
require_file scripts/praxis/deploy-compose.sh
require_file scripts/praxis/rollback-compose.sh
require_file scripts/praxis/target-smoke.sh

if grep -q 'ghcr.io/openhands/agent-canvas' .github/workflows/docker.yml; then
  echo "ERROR: Docker workflow still targets the OpenHands Agent Canvas registry" >&2
  fail=1
else
  echo "OK: Docker workflow publishes to the Praxis namespace"
fi

if grep -q '"agentCanvas": "ghcr.io/openhands/agent-canvas"' config/defaults.json; then
  echo "ERROR: config/defaults.json still defaults to the OpenHands Agent Canvas image" >&2
  fail=1
else
  echo "OK: config/defaults.json uses the Praxis image namespace"
fi

if [ "$fail" -ne 0 ]; then
  echo "Repository static checks FAILED" >&2
  exit 1
fi

echo "Repository static checks PASSED"
