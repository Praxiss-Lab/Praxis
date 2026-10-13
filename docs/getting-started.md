# Installation

Choose how to run Praxis. All options run on machines you control.

| Setup                         | Where it runs                                                | Section                                               |
| ----------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| Native from source            | Linux, macOS, or WSL 2 on Windows                            | [From source](#from-source)                           |
| Native release                | Same, without cloning the repository                         | [Published release](#published-release)               |
| Complete container            | Frontend and backend in one Docker container                 | [Docker](#docker)                                     |
| Separate frontend and backend | Separate processes or containers, on one or several machines | [Distribution guide](distribution/README.md)          |
| Personal cloud                | Backend on your VM, frontend wherever you use Praxis         | [Self-hosting](SELF_HOSTING.md)                       |

## From source

Install Git, Node.js 24 or later, npm and `uv`. On Windows use [WSL 2](https://github.com/Praxiss-Lab/praxis/blob/main/README.windows.md).

```sh
git clone https://github.com/Praxiss-Lab/praxis.git
cd praxis
npm ci
npm run dev
```

Open <http://localhost:8000> and configure your model provider in the UI. This starts the
frontend, Agent Server, Automation and ingress.

> [!WARNING]
> Native agent execution can access the host filesystem. Choose the workspace you
> intend to use, or enable [conversation isolation](#conversation-isolation).

## Published release

Download the archive attached to the [latest GitHub release](https://github.com/Praxiss-Lab/praxis/releases)
and install it globally:

```sh
npm install -g ./praxis-<version>.tgz
agent-canvas
```

Open <http://localhost:8000/canvas/>. The executable keeps the historical name
`agent-canvas`.

## Docker

```sh
export PRAXIS_IMAGE="ghcr.io/praxiss-lab/praxis:<version>"
export PROJECTS_PATH="$HOME/projects"
mkdir -p "$PROJECTS_PATH" "$HOME/.openhands"
docker run -it --rm --name praxis \
  -p 127.0.0.1:8000:8000 \
  -e PRAXIS_MODE=all \
  -e AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=true \
  -v "$HOME/.openhands:/home/openhands/.openhands" \
  -v "${PROJECTS_PATH}:/projects" \
  "$PRAXIS_IMAGE"
```

Open <http://localhost:8000/canvas/>. The mounted state directory keeps conversations and
settings; `/projects` exposes your host projects to the agent. The image supports Linux
`amd64` and `arm64`.

This setup publishes only on loopback. For remote access, configure authentication and
networking as described in [Self-hosting](SELF_HOSTING.md).

## Launch modes

| Mode     | Native launcher                | Container setting      | Services                                    |
| -------- | ------------------------------ | ---------------------- | ------------------------------------------- |
| Complete | `agent-canvas`                 | `PRAXIS_MODE=all`      | Frontend, Agent Server, Automation, ingress |
| Backend  | `agent-canvas --backend-only`  | `PRAXIS_MODE=backend`  | Agent Server, Automation, API ingress       |
| Frontend | `agent-canvas --frontend-only` | `PRAXIS_MODE=frontend` | Frontend server, optional backend proxy     |

## Conversation isolation

With Docker available on the host, the native launcher can run each conversation in
its own container:

```sh
OH_CONVERSATION_RUNTIME=docker agent-canvas
```

## Next steps

- Configure models, skills and MCP in the [User guide](USER_GUIDE.md).
- Understand the frontend/backend split in [Architecture](architecture.md).
- Develop Praxis itself with the [Development guide](DEVELOPMENT.md).
