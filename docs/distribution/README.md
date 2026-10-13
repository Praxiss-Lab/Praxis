# Praxis distribution and launch modes

Use Praxis directly on the host or through Docker. The frontend and backend can run together or independently. A VM running the backend is a personal cloud; several VMs can provide separate personal clouds selected from the frontend.

## Modes

| Mode     | Native launcher                | Docker environment     | Services                                    |
| -------- | ------------------------------ | ---------------------- | ------------------------------------------- |
| Complete | `agent-canvas`                 | `PRAXIS_MODE=all`      | Frontend, Agent Server, Automation, ingress |
| Backend  | `agent-canvas --backend-only`  | `PRAXIS_MODE=backend`  | Agent Server, Automation, API ingress       |
| Frontend | `agent-canvas --frontend-only` | `PRAXIS_MODE=frontend` | Frontend server and optional backend proxy  |

One image contains all three modes. Selecting frontend mode still downloads the full image. Docker also accepts `--all`, `--backend-only` or `--frontend-only` after the image name; the flag overrides `PRAXIS_MODE`.

## Select an artifact

Published artifacts are attached to [Praxis releases](https://github.com/Praxiss-Lab/Praxis/releases). For Docker:

```sh
export PRAXIS_IMAGE="ghcr.io/praxiss-lab/praxis:1.25.0"
docker pull "$PRAXIS_IMAGE"
```

Docker selects `amd64` or `arm64`. Docker Desktop provides the Linux container environment on Windows/macOS; see the [Windows guide](../../README.windows.md).

For a native installation, follow the [source quickstart](../../README.md#quickstart-from-source) or [release archive instructions](../../README.md#install-a-published-release-without-docker). Native launchers require Node.js 24+, npm and `uv` / `uvx`; Windows uses WSL 2. Download the archive from the Praxis release instead of installing a package with the same technical name from another registry.

To build an image from a checkout with Node.js 24+ and Docker:

```sh
node scripts/docker-build.mjs --tag praxis:local
export PRAXIS_IMAGE=praxis:local
```

## Complete container

With `PRAXIS_IMAGE` set:

```sh
docker run --rm --name praxis -p 127.0.0.1:18080:8000 \
  -e PRAXIS_MODE=all \
  -e AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=true \
  -v praxis-state:/home/openhands/.openhands \
  -v praxis-projects:/projects "$PRAXIS_IMAGE"
```

Open `http://127.0.0.1:18080/canvas/`. Named volumes retain state and projects across container replacement. Replace the project volume with a bind mount to work on an existing host directory. This local example enables session-key injection only with a loopback port binding.

## Separate containers on one machine

From the repository checkout, with `PRAXIS_IMAGE` set:

```sh
export PRAXIS_SESSION_API_KEY="$(openssl rand -hex 32)"
docker compose -f docker/compose.split.yml up -d
```

Open `http://127.0.0.1:18080/canvas/`; backend health is at `http://127.0.0.1:18081/health`. Enter the generated key when the frontend requests it. Preserve that key for backend recreation; the frontend does not generate or embed it.

State and projects use named volumes. `docker compose -f docker/compose.split.yml down` stops the stack and retains the volumes. The project volume is separate from host directories; use a Compose bind mount when you need existing host files.

## Backend on your VM

On the backend machine, select the released image, create and retain a strong session API key, and launch:

```sh
export PRAXIS_IMAGE="ghcr.io/praxiss-lab/praxis:1.25.0"
export PRAXIS_SESSION_API_KEY="$(openssl rand -hex 32)"
docker run -d --name praxis-backend --restart unless-stopped \
  -p 127.0.0.1:8000:8000 \
  -e PRAXIS_MODE=backend \
  -e OH_SESSION_API_KEYS_0="$PRAXIS_SESSION_API_KEY" \
  -v praxis-state:/home/openhands/.openhands \
  -v praxis-projects:/projects "$PRAXIS_IMAGE"
```

Put an HTTPS reverse proxy or private-network tunnel in front of this loopback endpoint, using the [self-hosting guide](../SELF_HOSTING.md). Backend mode serves APIs and Automation; it does not serve `/canvas/`.

On the frontend machine, with `PRAXIS_IMAGE` set:

```sh
docker run --rm -p 127.0.0.1:18080:8000 \
  -e PRAXIS_MODE=frontend \
  -e PRAXIS_BACKEND_URL=https://backend.example.com \
  "$PRAXIS_IMAGE"
```

Replace the example address with your backend origin. It must be reachable **from the frontend container**, with no path or embedded credentials. The proxy forwards API and WebSocket requests with browser-supplied authentication. Enter the backend key in the frontend.

Without `PRAXIS_BACKEND_URL`, frontend mode serves the UI and you can register Agent Server backends in the backend selector. For these direct connections, the browser must reach each backend and its allowed-origin settings must permit the frontend origin. Each VM has its own state, keys and workspaces; selecting a backend does not merge them.

For the optional browser editor, set `OH_CANVAS_ENABLE_VSCODE=true` on the backend and `PRAXIS_EDITOR_PATH=/vscode` on a proxying frontend, matching the backend's `VSCODE_BASE_PATH`.

## Native split mode

After installing a release archive, run `agent-canvas --backend-only` on the backend host and `agent-canvas --frontend-only` on the frontend host. Native launchers default to port 8000; choose separate ports when both run on one machine. Remote backend exposure needs explicit host binding, authentication and the same network configuration as Docker.

From source, the corresponding commands are `npm run dev -- --backend-only` and `npm run dev -- --frontend-only`.

## Publication

`Praxis Release` is manually dispatched from `main`. It verifies the selected commit, builds the native archive, checks Docker launch modes, publishes the image and creates the GitHub release. Docker publication builds `amd64` and `arm64` on separate native runners with separate caches, then combines digests from that same run into one image index.

PRs and ordinary pushes do not publish registry packages. Stable releases receive a version tag and `latest`. Pulling and starting an artifact is the deployment step; releases do not deploy automatically to your machines. See the [release policy](../policies/RELEASE.md).
