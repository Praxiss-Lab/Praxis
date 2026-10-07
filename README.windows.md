# Praxis on Windows

Use Docker Desktop for the published container image, or WSL 2 for source/native
launchers. See the [main README](README.md) for the installation options.

## Docker (PowerShell)

**Prerequisites:** Docker Desktop running Linux containers, and a projects
folder to mount into Praxis.

```powershell
$env:PRAXIS_IMAGE = "ghcr.io/emilio-01-t/praxis:1.25.0"
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
Settings and conversations persist in the mounted `.openhands` folder. The agent
can access the mounted projects. Stop with `Ctrl+C`; host folders remain after
the container is removed.

Docker selects amd64 or arm64 for its engine. `linux` in the image platform refers
to the container operating system, not the Windows host.

The quickstart publishes only to host loopback before allowing local session-key
injection. For LAN/public access, omit `AGENT_CANVAS_ALLOW_LAN_SESSION_KEY`, set
`LOCAL_BACKEND_API_KEY` to a strong key, and enter it in Canvas. See
[self-hosting](docs/SELF_HOSTING.md) for network exposure and HTTPS.

Retrieve the automatically generated key from the running quickstart container:

```powershell
docker exec praxis cat /home/openhands/.openhands/agent-canvas/api-key.txt
```

## Source and native release installation (WSL 2)

Inside your WSL Linux distribution, install Git, Node.js 24 or later, npm and
`uv` / `uvx`. Use workspace paths inside that Linux environment.

Follow either the [source quickstart](README.md#quickstart-from-source) or the
[published release installation](README.md#install-a-published-release-without-docker)
in the WSL shell. Both use Praxis sources/artifacts. Installing the inherited
package name directly from npm downloads upstream OpenHands.

Open [http://localhost:8000](http://localhost:8000) after launching the stack.

## Split Docker containers

With Git installed, clone the repository in PowerShell to obtain its Compose file:

```powershell
git clone https://github.com/Emilio-01-T/Praxis.git
Set-Location Praxis
$env:PRAXIS_IMAGE = "ghcr.io/emilio-01-t/praxis:1.25.0"
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:PRAXIS_SESSION_API_KEY = [BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()
docker compose -f docker/compose.split.yml up -d
```

Frontend: [http://localhost:18080/canvas/](http://localhost:18080/canvas/).
Backend health: [http://localhost:18081/health](http://localhost:18081/health).
Enter `PRAXIS_SESSION_API_KEY` when Canvas asks for the backend key. Keep that key
available when recreating the backend. Compose stores state and projects in
named volumes; `docker compose -f docker/compose.split.yml down` retains them.
These project volumes are separate from the host projects folder used above.

See [distribution and launch modes](docs/distribution/README.md) for backend and
frontend on separate machines.

## Per-conversation sandboxes (WSL 2)

Enable Docker Desktop's WSL integration for your Linux distribution and confirm
`docker info` succeeds in the WSL shell. After installing the Praxis release
archive there:

```sh
OH_CONVERSATION_RUNTIME=docker agent-canvas
```

This runtime uses POSIX user/group IDs and requires WSL 2 on Windows. It isolates
conversation execution while Canvas and Automation run in the WSL environment.
