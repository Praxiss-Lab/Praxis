# Local Laptop Runtime Evidence

Status: VERIFIED FOR FOUNDATION CLOSURE SCOPE
Date: 2026-10-06 (Europe/Rome)

## Scope and evidence source

Execution took place on the owner's Ubuntu laptop, not on a VM or Dokploy.
Terminal outputs were supplied by the owner; UI checks were confirmed by the
owner in the maintenance conversation. The maintainer did not directly operate
the laptop. Provider/model identity and visual recordings were not supplied.

This record verifies basic application operation and restart persistence.
It does not establish all product acceptance criteria or production readiness.

## Environment and artifact

- architecture: `x86_64` / amd64;
- Docker Engine: `29.1.3`;
- storage driver: `overlay2`;
- Docker Compose: `v5.5.1` (available, but this test used Docker run);
- tested source commit: `31754b2c0944e916dbeda50166940a9395e4936e`;
- image tag: `ghcr.io/emilio-01-t/praxis:sha-31754b2`;
- pull digest matched:
  `sha256:35b887a4cbdda60c25131a55077ea398b19978337093e24779c2caf285d78707`;
- container: `praxis-foundation-test`;
- container ID: `f089edca88a9be60fd97f9b6b2fe7e972b2fa5ae5f6b2d1a26389a0fc720363f`;
- loopback port mapping: `127.0.0.1:18080:8000`;
- dedicated volume: `praxis-foundation-test-state:/home/openhands/.openhands`.

## Executed launch

```bash
sudo docker run -d \
  --name praxis-foundation-test \
  -p 127.0.0.1:18080:8000 \
  -e AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=true \
  -e VITE_DO_NOT_TRACK=1 \
  -v praxis-foundation-test-state:/home/openhands/.openhands \
  ghcr.io/emilio-01-t/praxis@sha256:35b887a4cbdda60c25131a55077ea398b19978337093e24779c2caf285d78707
```

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Pull pinned image | PASS | supplied pull output, matching manifest digest |
| Container starts | PASS | supplied Docker ps output: Up, intended loopback mapping |
| Frontend HTTP | PASS | `Frontend HTTP=200` at `/canvas/` |
| Backend health | PASS | `{"status":"ok"}`, `Backend HTTP=200` at `/health` |
| UI loads | PASS — operator confirmed | owner confirmed the requested UI check |
| LLM profile configuration | PASS — operator confirmed | owner confirmed profile setup worked |
| Conversation response | PASS — operator confirmed | owner confirmed requested conversation smoke worked; exact reply not captured |
| Backend after restart | PASS | supplied health output returned 200 after two connection-reset responses |
| Profile survives restart | PASS — operator confirmed | owner confirmed the persistence checklist |
| Conversation survives restart | PASS — operator confirmed | owner confirmed the persistence checklist |
| New message after restart | PASS — operator confirmed | owner confirmed a response after restart |

The two early connection resets during restart were followed by a successful
health response. Startup readiness was observed by repeated requests, not by
an automated readiness gate.

## Not exercised / deferred

- VM/Dokploy deployment and migration of an existing production installation;
- restoring a previous image (rollback);
- isolated Docker/Sysbox/project-container operation;
- Preview Gateway;
- Memory and User Skills retention;
- full automation scheduling/execution lifecycle;
- server-side persistence across a new browser/client;
- main branch protection activation.

The local container was not given a host Docker socket by the launch command.
A working conversation does not prove the separate isolation/preview paths.

## Owner's closure decision

On 2026-10-06 the owner accepted repository setup plus these local runtime
checks as the Fork Foundation scope, and explicitly postponed VM, rollback
and main protection. `FOUNDATION_READY` authorizes product development under
this scope; deferred work remains recorded in `EXTERNAL_GATES.md`.
