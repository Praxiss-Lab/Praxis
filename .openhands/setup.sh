#!/usr/bin/env bash
set -euo pipefail
# Compatibility entry point for agents that discover .openhands/setup.sh.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec bash "$ROOT/scripts/praxis/setup.sh" "$@"
