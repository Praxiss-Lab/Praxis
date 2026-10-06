#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${1:-${PRAXIS_CONTAINER:-}}"
OUT="${2:-praxis-predeploy-state.json}"

if [[ -z "$CONTAINER" ]]; then
  echo "usage: $0 <container-name-or-id> [output.json]" >&2
  echo "or set PRAXIS_CONTAINER" >&2
  exit 2
fi

command -v docker >/dev/null || { echo "docker is required" >&2; exit 1; }

docker inspect "$CONTAINER" >/dev/null

python3 - "$CONTAINER" "$OUT" <<'PY'
import json, subprocess, sys, datetime

container, out = sys.argv[1], sys.argv[2]
raw = subprocess.check_output(["docker", "inspect", container], text=True)
info = json.loads(raw)[0]

state = {
    "recorded_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "container": info.get("Name", "").lstrip("/"),
    "container_id": info.get("Id"),
    "configured_image": info.get("Config", {}).get("Image"),
    "image_id": info.get("Image"),
    "state": {
        "status": info.get("State", {}).get("Status"),
        "running": info.get("State", {}).get("Running"),
        "health": (info.get("State", {}).get("Health") or {}).get("Status"),
    },
    "compose": {
        "project": info.get("Config", {}).get("Labels", {}).get("com.docker.compose.project"),
        "service": info.get("Config", {}).get("Labels", {}).get("com.docker.compose.service"),
        "working_dir": info.get("Config", {}).get("Labels", {}).get("com.docker.compose.project.working_dir"),
        "config_files": info.get("Config", {}).get("Labels", {}).get("com.docker.compose.project.config_files"),
    },
    "mounts": [
        {
            "type": m.get("Type"),
            "source": m.get("Source"),
            "destination": m.get("Destination"),
            "rw": m.get("RW"),
        }
        for m in info.get("Mounts", [])
    ],
}

with open(out, "w", encoding="utf-8") as f:
    json.dump(state, f, indent=2)
    f.write("\n")

print(json.dumps(state, indent=2))
print(f"\nSaved pre-deploy state to: {out}")
PY
