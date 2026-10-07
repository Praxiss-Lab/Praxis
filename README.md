# Praxis

**AI-Driven Development**

Praxis is an independently maintained, MIT-licensed fork of
[OpenHands Agent Canvas](https://github.com/OpenHands/OpenHands). It provides a
web interface for coding agents, conversations and automations, using the
OpenHands Agent Server and Automation services.

Run the complete stack locally, or run frontend and backend separately on the
same machine or different machines. Both native launchers and Docker support
these modes.

Praxis is not affiliated with or endorsed by OpenHands. The inherited package
name `@openhands/agent-canvas`, launcher `agent-canvas` and `.openhands` state
folder are retained for compatibility.

## Quickstart from source

Use this path to develop Praxis from the current repository checkout.

**Prerequisites:** Git, Node.js 24 or later (with npm), and `uv` / `uvx` on your
PATH. On Windows, run these commands inside WSL 2; see the
[Windows guide](README.windows.md).

```sh
git clone https://github.com/Emilio-01-T/Praxis.git
cd Praxis
npm ci
npm run dev
```

The launcher starts the frontend, Agent Server, Automation and ingress. It uses
`uvx` to install and run the pinned Python services; Docker is not required for
this path. If you need environment overrides, create an optional `.env` before
starting the launcher.

Open [http://localhost:8000](http://localhost:8000). Configure your model/provider
in Canvas before starting an agent conversation. Stop the stack with `Ctrl+C`.

> [!WARNING]
> Native execution runs the agent on your machine with access to your filesystem.

For a built frontend from the checkout:

```sh
npm run build
npm run dev:static
```

## Install a published release without Docker

**Prerequisites:** Node.js 24 or later, npm and `uv` / `uvx`. Use Linux or macOS;
Windows users should use WSL 2.

Download the `.tgz` archive from a [Praxis release](https://github.com/Emilio-01-T/Praxis/releases).
For version `1.25.0`, run:

```sh
curl -fL --output openhands-agent-canvas-1.25.0.tgz \
  https://github.com/Emilio-01-T/Praxis/releases/download/v1.25.0/openhands-agent-canvas-1.25.0.tgz
npm install -g ./openhands-agent-canvas-1.25.0.tgz
agent-canvas
```

Open [http://localhost:8000](http://localhost:8000). This serves the frontend built
into the release archive and starts the backend services through `uvx`.

Installing `@openhands/agent-canvas` by name from npm downloads upstream OpenHands.
To install this fork, use the Praxis release archive above. The archive retains
the original package name and replaces a global installation with that name.

## Run a published Docker image

**Prerequisites:** Docker Engine on Linux, or Docker Desktop on macOS/Windows
configured to run Linux containers. The image supports amd64 and arm64; Docker
selects the architecture for the machine running the Docker engine.

**Linux / macOS:**

```sh
export PRAXIS_IMAGE="ghcr.io/emilio-01-t/praxis:1.25.0"
export PROJECTS_PATH="$HOME/projects"
mkdir -p "$PROJECTS_PATH" "$HOME/.openhands"
docker pull "$PRAXIS_IMAGE"

docker run -it --rm --name praxis \
  -p 127.0.0.1:8000:8000 \
  -e PRAXIS_MODE=all \
  -e AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=true \
  -v "$HOME/.openhands:/home/openhands/.openhands" \
  -v "${PROJECTS_PATH}:/projects" \
  "$PRAXIS_IMAGE"
```

Open [http://localhost:8000/canvas/](http://localhost:8000/canvas/).
Settings and conversations persist under the mounted `.openhands` directory.
The agent can access the mounted projects. `Ctrl+C` stops the container; `--rm`
removes the stopped container while retaining those host directories.

For PowerShell commands, see the [Windows guide](README.windows.md#docker-powershell).

## Run frontend and backend separately

| Mode | Installed native launcher | Docker environment | Services |
| --- | --- | --- | --- |
| Complete | `agent-canvas` | `PRAXIS_MODE=all` | Frontend, Agent Server, Automation, ingress |
| Backend | `agent-canvas --backend-only` | `PRAXIS_MODE=backend` | Agent Server, Automation, API ingress |
| Frontend | `agent-canvas --frontend-only` | `PRAXIS_MODE=frontend` | Frontend serving and optional backend proxy |

From source, use `npm run dev -- --backend-only` or
`npm run dev -- --frontend-only` in separate terminals/checkouts, choosing
non-conflicting ingress ports if both run on the same machine.

Docker uses the same image for every mode. See
[distribution and launch modes](docs/distribution/README.md) for split Compose,
separate machines, frontend proxy settings and local image builds.

## Use a Docker sandbox for each conversation

After installing the native Praxis release archive, run:

```sh
OH_CONVERSATION_RUNTIME=docker agent-canvas
```

This also requires Docker and access to its daemon. Each new conversation runs
in its own container; Canvas and Automation remain on the host. Existing local
conversations are not converted. Workspace and conversation mounts persist
across container replacement. Conversations using the same host workspace can
still modify the same files.

Windows users must run this mode inside WSL 2 with Docker Desktop integration;
see the [Windows guide](README.windows.md#per-conversation-sandboxes-wsl-2).

## Connections and authentication

Native launchers bind to `127.0.0.1` by default. To listen on another interface,
use `--host` or `OH_BIND_HOST`; a non-loopback bind disables automatic session-key
injection. Enter the backend key in Canvas when requested.

The Docker quickstart above publishes only to host loopback and explicitly
allows local session-key injection. For a LAN/public deployment, omit
`AGENT_CANVAS_ALLOW_LAN_SESSION_KEY`, set `LOCAL_BACKEND_API_KEY` to a strong key,
and enter that key in the UI. Follow the [self-hosting guide](docs/SELF_HOSTING.md)
for network exposure and HTTPS.

For the automatically generated key in the running quickstart container:

```sh
docker exec praxis cat /home/openhands/.openhands/agent-canvas/api-key.txt
```

## Architecture and documentation

Praxis provides Canvas and local-stack orchestration. The
[OpenHands Agent Server](https://github.com/OpenHands/software-agent-sdk) provides
agent execution and its REST/WebSocket APIs;
[OpenHands Automation](https://github.com/OpenHands/automation) provides scheduling
and dispatch. Automation is included in the complete and backend-only stacks.

- [Installation and launch modes](docs/distribution/README.md)
- [Windows instructions](README.windows.md)
- [Documentation index](docs/README.md)
- [Architecture overview](docs/architecture.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Using ACP agents](docs/ACP_AGENTS.md)
- [Release policy](docs/policies/RELEASE.md)
- [Versioning](docs/policies/VERSIONING.md)
- [Upstream baseline](docs/upstream/BASELINE.md)
- [Contributing](CONTRIBUTING.md)
- [MIT license](LICENSE) and [attribution](NOTICE)
