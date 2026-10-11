# Praxis on Windows

Run Praxis with Docker Desktop, or directly inside WSL 2. The frontend and backend can run together or independently; a backend on your VM is your personal cloud. See the [main README](README.md) for all installation options.

## Complete stack with Docker (PowerShell)

**Prerequisites:** Docker Desktop running Linux containers, and a projects
folder to mount into Praxis.

```powershell
$env:PRAXIS_IMAGE = "ghcr.io/praxiss-lab/praxis:1.25.0"
$env:PROJECTS_PATH = Join-Path $env:USERPROFILE "projects"
New-Item -ItemType Directory -Force -Path $env:PROJECTS_PATH, (Join-Path $env:USERPROFILE ".openhands") | Out-Null
docker pull "${env:PRAXIS_IMAGE}"

docker run -it --rm --name praxis `
  -p 127.0.0.1:8000:8000 `
  -e PRAXIS_MODE=all `
  -e AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=true `
  -v "$($env:USERPROFILE)\.openhands:/home/openhands/.openhands" `
  -v "$($env:PROJECTS_PATH):/projects" `
  "${env:PRAXIS_IMAGE}"
```

Open [http://localhost:8000/canvas/](http://localhost:8000/canvas/).
The state mount retains settings and conversations. Agents work in the mounted project directory. Stop with `Ctrl+C`; replacing the container preserves both host directories.

Docker selects amd64 or arm64 for its engine. `linux` in the image platform refers
to the container operating system, not the Windows host.

The quickstart publishes only to host loopback before allowing local session-key
injection. For LAN/public access, omit `AGENT_CANVAS_ALLOW_LAN_SESSION_KEY`, set
`LOCAL_BACKEND_API_KEY` to a strong key, and enter it in Praxis. See
[self-hosting](docs/SELF_HOSTING.md) for network exposure and HTTPS.

Retrieve the automatically generated key from the running quickstart container:

```powershell
docker exec praxis cat /home/openhands/.openhands/agent-canvas/api-key.txt
```

## Run directly in WSL 2

Inside your WSL Linux distribution, install Git, Node.js 24 or later, npm and
`uv` / `uvx`. Use workspace paths inside that Linux environment.

Follow either the [source quickstart](README.md#quickstart-from-source) or the
[published release installation](README.md#install-a-published-release-without-docker)
in the WSL shell. Use the sources or archive linked there. The native executable remains `agent-canvas`; download the archive from the Praxis GitHub release.

Open [http://localhost:8000](http://localhost:8000) after launching the stack.

## Separate frontend and backend containers

With Git installed, clone the repository in PowerShell to obtain its Compose file:

```powershell
git clone https://github.com/Praxiss-Lab/Praxis.git
Set-Location Praxis
$env:PRAXIS_IMAGE = "ghcr.io/praxiss-lab/praxis:1.25.0"
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:PRAXIS_SESSION_API_KEY = [BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()
docker compose -f docker/compose.split.yml up -d
```

Frontend: [http://localhost:18080/canvas/](http://localhost:18080/canvas/).
Backend health: [http://localhost:18081/health](http://localhost:18081/health).
Enter `PRAXIS_SESSION_API_KEY` when Praxis asks for the backend key. Keep that key
available when recreating the backend. Compose stores state and projects in
named volumes; `docker compose -f docker/compose.split.yml down` retains them.
These project volumes are separate from the host projects folder used above.

See [distribution and launch modes](docs/distribution/README.md) for backend and
frontend on separate machines.

## Isolate conversation execution

Enable Docker Desktop's WSL integration for your Linux distribution and confirm
`docker info` succeeds in the WSL shell. After installing the Praxis release
archive there:

```sh
OH_CONVERSATION_RUNTIME=docker agent-canvas
```

This runtime uses POSIX user/group IDs and requires WSL 2 on Windows. It isolates
conversation execution while Canvas and Automation run in the WSL environment.

## Personal clouds

Run a backend on each VM you control and add its Agent Server address and API key in the frontend backend selector. Each installation has independent storage and credentials. The browser must reach the backend for direct connections; a configured frontend proxy must reach it from its container. See the [distribution guide](docs/distribution/README.md#backend-on-your-vm) for commands.
