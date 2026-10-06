# Praxis Target VM Foundation Runbook

Status: READY FOR EXECUTION

This runbook closes the final runtime deployment gates of the Praxis Fork
Foundation without storing VM addresses, credentials, or private infrastructure
details in the public repository.

## Immutable Foundation image

For the current Foundation baseline:

```text
Praxis main commit:
31754b2c0944e916dbeda50166940a9395e4936e

Praxis image:
ghcr.io/emilio-01-t/praxis:sha-31754b2
```

GitHub Actions Docker run `37461832805` successfully built and published the
amd64 and arm64 images and the multi-architecture manifest.

## Safety model

The deployment scripts:

- require an immutable Praxis `sha-*` tag or digest;
- touch only the configured application service;
- do not recreate dependency services;
- do not delete volumes;
- record the prior running image before deployment;
- use a Compose override rather than rewriting the Dokploy-generated base file;
- retain rollback state outside the Git repository;
- require a smoke check after deploy and rollback.

## Required environment on the target VM

Set only local shell variables; do not commit them:

```bash
export PRAXIS_COMPOSE_DIR="<Dokploy Compose directory>"
export PRAXIS_COMPOSE_SERVICE="agent-canvas"
export PRAXIS_COMPOSE_FILE="docker-compose.yml"
export PRAXIS_DEPLOY_STATE_DIR="/var/lib/praxis-deployments"
export PRAXIS_SMOKE_URL="http://127.0.0.1:8000/canvas"
```

Adjust the service name or local smoke URL only if the actual Compose
configuration differs.

## Deploy

From a checkout of Praxis at the intended Foundation commit:

```bash
sudo -E bash scripts/praxis/deploy-compose.sh \
  ghcr.io/emilio-01-t/praxis:sha-31754b2
```

Record the script output as deployment evidence.

## Runtime smoke

```bash
sudo -E bash scripts/praxis/target-smoke.sh
```

The minimum expected terminal result is:

```text
TARGET_SMOKE=PASS
```

The Foundation operator must additionally verify the application-specific
persistent state that cannot be proven by an HTTP probe alone:

- expected Agent Canvas/Praxis profile is still present;
- required Memory/configuration remains available;
- a conversation can start;
- isolated Docker/Sysbox access still works;
- Preview Gateway behavior still works;
- restart preserves expected state.

These checks are evidence obligations, not assumptions.

## Rollback test

Use the deployment state file emitted by the deploy step:

```bash
sudo -E bash scripts/praxis/rollback-compose.sh
sudo -E bash scripts/praxis/target-smoke.sh
```

A successful rollback must restore the previous application image without
deleting project or application volumes.

After proving rollback, redeploy the Praxis immutable image and run the smoke
check again.

## Evidence to record

For Foundation completion, record:

- deployment timestamp;
- target Praxis image ref;
- running image ID;
- prior image ref/digest;
- deploy smoke result;
- application/profile/Memory checks;
- Docker/Sysbox check;
- Preview Gateway check;
- restart persistence check;
- rollback image and resulting image ID;
- rollback smoke result;
- final redeploy image and smoke result.

Do not put credentials, API keys, private IPs, or authentication tokens in the
public evidence record.
