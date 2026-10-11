#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${1:-${PRAXIS_CONTAINER:-}}"
STATE_FILE="${2:-praxis-predeploy-state.json}"

if [[ -z "$CONTAINER" ]]; then
  echo "usage: $0 <container-name-or-id> [predeploy-state.json]" >&2
  exit 2
fi

[[ -f "$STATE_FILE" ]] || { echo "missing state file: $STATE_FILE" >&2; exit 1; }
command -v docker >/dev/null || { echo "docker is required" >&2; exit 1; }

python3 - "$CONTAINER" "$STATE_FILE" <<'PY'
import json, subprocess, sys

container, state_file = sys.argv[1], sys.argv[2]
with open(state_file, encoding="utf-8") as f:
    before = json.load(f)

after = json.loads(subprocess.check_output(["docker", "inspect", container], text=True))[0]

errors = []

if not after.get("State", {}).get("Running"):
    errors.append("container is not running after rollback")

before_image = before.get("configured_image")
after_image = after.get("Config", {}).get("Image")
if before_image != after_image:
    errors.append(f"configured image mismatch: before={before_image!r} after={after_image!r}")

before_mounts = {
    (m.get("type"), m.get("source"), m.get("destination"))
    for m in before.get("mounts", [])
}
after_mounts = {
    (m.get("Type"), m.get("Source"), m.get("Destination"))
    for m in after.get("Mounts", [])
}
if before_mounts != after_mounts:
    errors.append("mount set changed across deployment/rollback")

if errors:
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    sys.exit(1)

print("Rollback verification: PASS")
print(f"restored configured image: {after_image}")
print("persistent mount set: unchanged")
PY
