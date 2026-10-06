# Praxis distribution and launch modes

Praxis keeps OpenHands' native launcher and adds equivalent Docker modes. A single
versioned image supports `all`, `backend`, and `frontend`. Selecting a mode controls
which services run; frontend mode still downloads the complete image.

| Mode | Native command | Docker environment | Services started |
| --- | --- | --- | --- |
| Complete | `agent-canvas` | `PRAXIS_MODE=all` (default) | Canvas, Agent Server, Automation, ingress |
| Backend | `agent-canvas --backend-only` | `PRAXIS_MODE=backend` | Agent Server, Automation, API ingress |
| Frontend | `agent-canvas --frontend-only` | `PRAXIS_MODE=frontend` | Canvas static server and optional backend proxy |

Docker also accepts `--frontend-only`, `--backend-only`, or `--all` after the image
name. A command-line mode overrides `PRAXIS_MODE`.

## Run the current checkout

No Praxis registry image is available until a maintainer publishes a release.
Build locally without publishing:

```sh
node scripts/docker-build.mjs --tag praxis:local
export PRAXIS_IMAGE=praxis:local
```

Complete stack:

```sh
docker run --rm -p 127.0.0.1:18080:8000 \
  -e AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=true \
  -v praxis-state:/home/openhands/.openhands \
  -v praxis-projects:/projects "$PRAXIS_IMAGE"
```

Open `http://127.0.0.1:18080/canvas/`. The inherited local session-key policy is
unchanged. Bind mounts can replace the named volumes to give the agent access to
specific host projects.

Split containers on one machine:

```sh
export PRAXIS_SESSION_API_KEY="$(openssl rand -hex 32)"
docker compose -f docker/compose.split.yml up -d
```

Frontend: `http://127.0.0.1:18080/canvas/`; backend: `http://127.0.0.1:18081/health`.
Enter `PRAXIS_SESSION_API_KEY` when Canvas requests the backend key. Frontend does
not generate or embed backend credentials. Backend state and projects persist in
named volumes; `docker compose down` keeps them.

## Frontend and backend on different machines

Run backend mode on the backend machine, supplying `OH_SESSION_API_KEYS_0` and
persistent volumes. Make its port 8000 reachable at your chosen HTTP(S) origin.
On the frontend machine:

```sh
docker run --rm -p 127.0.0.1:18080:8000 \
  -e PRAXIS_MODE=frontend \
  -e PRAXIS_BACKEND_URL=https://backend.example.com \
  "$PRAXIS_IMAGE"
```

`PRAXIS_BACKEND_URL` is the unified backend origin reachable **from the frontend
container**, without a path or embedded credentials. API and WebSocket requests
are forwarded with browser-supplied authentication. Automation remains part of
the backend. `/server_info` retains the backend's runtime-services metadata.
Backend mode serves APIs only; `/canvas/` does not serve the UI.

With no `PRAXIS_BACKEND_URL`, frontend mode serves Canvas and users can select a
separate backend through the inherited backend picker. Connectivity and CORS for
that direct browser connection follow the upstream configuration.

Optional browser editor: enable `OH_CANVAS_ENABLE_VSCODE=true` on the backend. To
proxy its editor through frontend mode too, set `PRAXIS_EDITOR_PATH=/vscode` on
the frontend, matching the backend's `VSCODE_BASE_PATH` (default `/vscode`).

## Native installation

For development, use the existing source launchers (`npm ci`, then `npm run dev`)
and the mode flags documented in the main README. Releases attach an npm `.tgz`
built from this checkout. Install that downloaded archive with
`npm install -g /path/to/package.tgz`, then use `agent-canvas` and its mode flags.
Node 24+ and `uv` are required for the native stack.

The npm package name `@openhands/agent-canvas` and binary `agent-canvas` remain
unchanged; its version matches `PRAXIS_VERSION`, starting at `1.25.0`.
Installing that name from npm
fetches upstream OpenHands, not this Praxis fork. Praxis does not publish to the
upstream npm namespace. The GitHub release and `PRAXIS_VERSION` identify the
Praxis artifact.

## Workflows and releases

- **Praxis CI / smoke / mock E2E:** validate code; documentation-only edits skip
  the expensive application suites.
- **Docker Check (`docker-check.yml`):** builds a local image and tests all/split
  modes, authentication, runtime metadata and backend restart. It uploads browser
  screenshots/video and never logs in to GHCR or publishes an image.
- **Praxis Release (`praxis-release.yml`):** manual dispatch from `main`, version
  equal to `PRAXIS_VERSION`, confirmation `RELEASE`. It verifies the dispatched
  commit, builds native artifacts, tests Docker, calls Docker publication directly,
  and creates the GitHub release on that exact commit.
- **Docker Release Image (`docker.yml`):** reusable publication job called by the
  release workflow. Publishes one amd64/arm64 image as
  `ghcr.io/emilio-01-t/praxis:<version>`; stable versions also get `latest`.
- **Mock-LLM Docker E2E:** optional manual test of an explicitly selected published
  release image.

PRs and pushes to `main` create no registry packages. There are no SHA/branch/PR
image tags, separate architecture package names, or target-specific deployment
jobs. To deploy, pull a released image and launch the desired mode. Release
publication does not depend on another workflow reacting to a token-created tag.
