# Praxis Foundation Deployment and Rollback

Status: DESIGN COMPLETE — runtime verification pending

## Objective

Praxis must be deployable from its own source and container pipeline without
depending on the mutable OpenHands Agent Canvas image tag.

The target production chain is:

```text
Praxis main/tag
→ GitHub Actions
→ ghcr.io/emilio-01-t/praxis:<immutable-tag>
→ Dokploy Compose
→ Agent Canvas/Praxis container
```

OpenHands Agent Server and other upstream runtime dependencies may remain
upstream dependencies until explicitly replaced.

## Image policy

Production deployments should use an immutable Praxis tag or digest.

Preferred examples:

```text
ghcr.io/emilio-01-t/praxis:sha-<commit>
ghcr.io/emilio-01-t/praxis:<praxis-release>
ghcr.io/emilio-01-t/praxis@sha256:<digest>
```

Do not use `latest` as the long-term production rollback anchor.

## Existing VM/Dokploy environment

The current self-hosted environment uses Dokploy-managed Compose and includes
separate Agent Canvas/Praxis, Docker-in-Docker/Sysbox, and Preview Gateway
services.

The Foundation migration must change only the application image source unless
the Compose contract itself is intentionally redesigned.

In particular, a Praxis application rollout must not silently replace or
reconfigure:

- the DinD/Sysbox service;
- project volume ownership;
- Preview Gateway;
- Traefik/Tinyauth routing;
- persistent Agent Canvas state;
- OpenHands Plan files.

## Deployment verification

A Foundation deployment is VERIFIED only when all of the following have been
observed on the target VM:

1. Dokploy/Compose resolves the intended Praxis image tag or digest;
2. the running container image ID matches the intended image;
3. Agent Canvas/Praxis starts successfully;
4. the existing `Software_Engineer` profile remains available;
5. Memory and required skills/configuration remain available;
6. a conversation can start;
7. Docker/Sysbox access still works through the existing isolated daemon;
8. Preview Gateway behavior remains functional;
9. restart preserves expected persistent state.

## Rollback contract

Before each production rollout, record:

- current running Praxis/OpenHands image reference;
- current image digest;
- target image reference/digest;
- relevant Compose revision.

Rollback means recreating only the application service with the previously
verified immutable image unless the incident requires a broader rollback.

A valid rollback must not delete persistent volumes or project data.

## Foundation limitation

The repository can define and build the deployment path, but VM execution
evidence must come from the actual target environment. Until that happens:

`DEPLOYMENT_VERIFICATION = PENDING`

and

`ROLLBACK_VERIFICATION = PENDING`.
