# Praxis Target VM Deployment Runbook

Status: READY FOR EXECUTION — remote access required

This runbook is the final Foundation procedure for deploying the independently
built Praxis image to the existing target VM and proving rollback.

## Immutable target

Foundation main commit:

`31754b2c0944e916dbeda50166940a9395e4936e`

Image:

`ghcr.io/emilio-01-t/praxis:sha-31754b2`

Multi-arch digest:

`sha256:35b887a4cbdda60c25131a55077ea398b19978337093e24779c2caf285d78707`

GitHub Docker run:

`37461832805` — SUCCESS

## Known target environment

The existing deployment has previously used Dokploy-managed Compose with the
application service separated from Docker-in-Docker/Sysbox and Preview Gateway.

Previously observed target context:

- Compose directory:
  `/etc/dokploy/compose/compose-program-digital-sensor-emtfc8/code`
- Compose file:
  `docker-compose.yml`
- application container:
  `compose-program-digital-sensor-emtfc8-agent-canvas-1`

These values **must be revalidated on the VM before editing anything**. They
are not treated as current truth until the deployment session confirms them.

## Safety invariants

The Foundation deployment changes the application image only.

Do not intentionally change:

- DinD/Sysbox image or configuration;
- Docker daemon exposure;
- project volumes;
- Preview Gateway;
- Traefik/Tinyauth routing;
- persistent Agent Canvas state;
- OpenHands Plan files;
- model/API credentials.

Do not remove volumes.

## 1. Revalidate target

Run:

```bash
whoami
hostname
pwd

cd /etc/dokploy/compose/compose-program-digital-sensor-emtfc8/code
sudo docker compose config --services
sudo docker compose ps
```

Confirm the intended application service before continuing.

## 2. Record rollback state

From a checkout containing the Praxis helper scripts, or by copying the script
contents to a temporary trusted location:

```bash
sudo bash scripts/praxis/vm-record-state.sh \
  compose-program-digital-sensor-emtfc8-agent-canvas-1 \
  /tmp/praxis-predeploy-state.json
```

Keep the JSON until rollback verification is complete.

Also record the Compose file before modification:

```bash
sudo cp docker-compose.yml /tmp/docker-compose.yml.pre-praxis
sudo docker inspect compose-program-digital-sensor-emtfc8-agent-canvas-1 \
  --format '{{.Config.Image}} {{.Image}}'
```

## 3. Pull immutable Praxis image

```bash
sudo docker pull ghcr.io/emilio-01-t/praxis:sha-31754b2
sudo docker buildx imagetools inspect ghcr.io/emilio-01-t/praxis:sha-31754b2
```

The manifest digest must resolve to:

`sha256:35b887a4cbdda60c25131a55077ea398b19978337093e24779c2caf285d78707`

If the package requires authentication on the VM, stop and authenticate to
GHCR using a token with only the minimum package-read permission. Do not place
tokens in the Compose file or repository.

## 4. Change only the application image

Edit the application service image in the Dokploy Compose source from the
current OpenHands/old application image to:

`ghcr.io/emilio-01-t/praxis:sha-31754b2`

Before applying:

```bash
sudo docker compose config > /tmp/praxis-compose-rendered.yml
```

Inspect the diff and ensure no other service or volume changed.

## 5. Recreate only the application service

Use the actual Compose service name confirmed in step 1.

Expected pattern:

```bash
sudo docker compose up -d --no-deps --force-recreate agent-canvas
```

Do not recreate DinD or Preview Gateway as part of this Foundation test.

## 6. Verify container identity

```bash
sudo bash scripts/praxis/vm-verify-runtime.sh \
  compose-program-digital-sensor-emtfc8-agent-canvas-1 \
  ghcr.io/emilio-01-t/praxis:sha-31754b2
```

Also record:

```bash
sudo docker compose ps
sudo docker logs --tail 200 compose-program-digital-sensor-emtfc8-agent-canvas-1
```

## 7. Runtime smoke

The following must be exercised in the real deployed environment:

1. Praxis/Agent Canvas UI loads through the existing authenticated route.
2. Existing `Software_Engineer` profile is present.
3. Memory and required User Skills/configuration are present.
4. A conversation can be created and started.
5. The existing isolated Docker/Sysbox daemon remains usable.
6. A project container can be created or inspected through the established runtime path.
7. Preview Gateway remains reachable and correctly routed.
8. Application restart preserves expected persistent state.

Evidence should record PASS/FAIL/UNKNOWN for each item.

## 8. Rollback test

Restore exactly the pre-deploy application image from
`/tmp/praxis-predeploy-state.json` and restore the Compose file if needed.

Then recreate only the application service.

Finally run:

```bash
sudo bash scripts/praxis/vm-verify-rollback.sh \
  compose-program-digital-sensor-emtfc8-agent-canvas-1 \
  /tmp/praxis-predeploy-state.json
```

Rollback is VERIFIED only if:

- the previous image reference is restored;
- the application container is running;
- the persistent mount set is unchanged;
- the UI/runtime returns to the prior working state.

## 9. Redeploy Praxis after successful rollback proof

Once rollback has been proven, deploy
`ghcr.io/emilio-01-t/praxis:sha-31754b2` again and repeat the runtime smoke.

The Foundation Gate should reflect the **final running state**, not merely the
temporary rollback state.

## Evidence required in repository

After execution, record:

- VM date/time;
- old image reference and image ID;
- Praxis image reference and resolved digest;
- Compose service recreated;
- runtime smoke results;
- rollback result;
- final deployed image;
- known limitations.

No secret values, API keys, cookies, or raw credentials belong in the record.
