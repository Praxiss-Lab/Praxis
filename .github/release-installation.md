## Install Praxis {{VERSION}}

Choose Docker or a native installation. Both support complete, backend-only and frontend-only modes. The backend includes Agent Server and Automation.

### Docker: download and start

Install Docker Engine on Linux, or Docker Desktop on macOS/Windows (with WSL 2 integration on Windows). The image supports Linux `amd64` and `arm64`; Docker selects the matching architecture.

To download only the image, use this direct command:

```sh
docker pull ghcr.io/praxiss-lab/praxis:{{VERSION}}
```

To download and start the complete application, use:

```sh
export PRAXIS_IMAGE="ghcr.io/praxiss-lab/praxis:{{VERSION}}"
docker pull "$PRAXIS_IMAGE"
docker run -it --rm --name praxis \
  -p 127.0.0.1:18080:8000 \
  -e PRAXIS_MODE=all \
  -e AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=true \
  -v praxis-state:/home/openhands/.openhands \
  -v praxis-projects:/projects \
  "$PRAXIS_IMAGE"
```

Open **http://127.0.0.1:18080/canvas/** and configure your model provider in the UI. On Linux, prefix Docker commands with `sudo` if your Docker installation requires it.

`Ctrl+C` stops this container. The named volumes keep conversations, settings and projects; rerun the same command to start again. To use an existing host project directory, replace `-v praxis-projects:/projects` with `-v /absolute/path/to/projects:/projects`. Choose only directories you intend the agent to access.

In another terminal, check the backend:

```sh
curl --fail --show-error --max-time 10 http://127.0.0.1:18080/health
```

A healthy backend responds with `{"status":"ok"}`. A successful health request alone does not verify model execution.

### Backend on a server or personal VM

Use the same versioned image on the server. Generate a session key once and retain it for subsequent starts:

```sh
export PRAXIS_IMAGE="ghcr.io/praxiss-lab/praxis:{{VERSION}}"
export PRAXIS_SESSION_API_KEY="$(openssl rand -hex 32)"
docker pull "$PRAXIS_IMAGE"
docker run -d --name praxis-backend --restart unless-stopped \
  -p 127.0.0.1:8000:8000 \
  -e PRAXIS_MODE=backend \
  -e OH_SESSION_API_KEYS_0="$PRAXIS_SESSION_API_KEY" \
  -v praxis-state:/home/openhands/.openhands \
  -v praxis-projects:/projects \
  "$PRAXIS_IMAGE"
```

This binds only to the server's loopback interface. Put an HTTPS reverse proxy or private-network tunnel in front of it as described in the [self-hosting guide](https://github.com/{{REPOSITORY}}/blob/v{{VERSION}}/docs/SELF_HOSTING.md). Backend mode serves the APIs and Automation; it does not serve `/canvas/`.

On your frontend device:

```sh
export PRAXIS_IMAGE="ghcr.io/praxiss-lab/praxis:{{VERSION}}"
docker pull "$PRAXIS_IMAGE"
docker run -it --rm --name praxis-frontend \
  -p 127.0.0.1:18080:8000 \
  -e PRAXIS_MODE=frontend \
  -e PRAXIS_BACKEND_URL=https://backend.example.com \
  "$PRAXIS_IMAGE"
```

Replace `https://backend.example.com` with your backend origin, reachable from the frontend container. Open **http://127.0.0.1:18080/canvas/** and enter the backend session key when requested. Without `PRAXIS_BACKEND_URL`, use the UI backend selector; direct connections require browser reachability and allowed-origin configuration.

For two containers on one machine, see the [split Compose instructions](https://github.com/{{REPOSITORY}}/blob/v{{VERSION}}/docs/distribution/README.md#separate-containers-on-one-machine). All modes download the same image and select which services to start. Each personal VM has independent state and credentials.

### Native installation without Docker

Install **Node.js 24+**, npm, and **uv/uvx** first. On Windows, run these commands inside WSL 2. Download the archive attached to this release:

```sh
curl --fail --location --output praxis-{{VERSION}}.tgz \
  https://github.com/{{REPOSITORY}}/releases/download/v{{VERSION}}/{{ARCHIVE}}
npm install -g ./praxis-{{VERSION}}.tgz
agent-canvas
```

Open **http://localhost:8000/canvas/**. Native agent execution can access the host filesystem: choose the intended workspace. If npm's global installation directory is not writable, configure a user-owned npm prefix.

For separate native processes, run `agent-canvas --backend-only` on the backend host and `agent-canvas --frontend-only` on the frontend host. Use separate ports if both run on one machine; see the [distribution guide](https://github.com/{{REPOSITORY}}/blob/v{{VERSION}}/docs/distribution/README.md). The archive filename and `agent-canvas` command are retained technical identifiers; this archive is distributed by Praxis.

### Artifacts and troubleshooting

- **Docker image:** `ghcr.io/praxiss-lab/praxis:{{VERSION}}`.
- **Native archive:** `{{ARCHIVE}}`, attached under Assets.
- **image.txt:** records the build's source commit and published image digest.
- This pipeline does not attach desktop installers. Native installation above starts the web application.
- If Docker returns `unauthorized`, the package owner must check that the organization permits public packages and that this package's visibility is **Public**. A public repository alone does not make its package public.
- If port 18080 is occupied, change only the host side of the port mapping and open that port in your browser.
- For startup errors, inspect the foreground output or run `docker logs praxis-backend` for the detached backend.

See the [versioned README](https://github.com/{{REPOSITORY}}/blob/v{{VERSION}}/README.md), [distribution guide](https://github.com/{{REPOSITORY}}/blob/v{{VERSION}}/docs/distribution/README.md), and [Windows instructions](https://github.com/{{REPOSITORY}}/blob/v{{VERSION}}/README.windows.md).
