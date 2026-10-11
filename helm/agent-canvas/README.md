# Praxis on Kubernetes

This experimental chart runs one complete Praxis instance as a StatefulSet: frontend, Agent Server, Automation and persistent storage. It provides a backend on your infrastructure; it is not a replicated backend cluster or a user-tenancy system.

## Install

Use a Praxis checkout, Helm, a configured Kubernetes context and a cluster with PVC provisioning. The chart defaults to the Praxis image. Explicitly select the release tag for deployment:

```sh
helm upgrade --install praxis ./helm/agent-canvas \
  --set fullnameOverride=praxis \
  --set image.repository=ghcr.io/praxiss-lab/praxis \
  --set image.tag=1.25.0
kubectl port-forward service/praxis 8000:8000
```

Open `http://localhost:8000/canvas/`. Enter the backend session key when requested. The chart supports persisted generated keys or keys supplied through Kubernetes Secrets.

## Resources and persistence

| Resource                     | Role                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| StatefulSet                  | One complete stack; keep the default single replica                         |
| PVC                          | Persistent settings, conversations, secrets, automation data and workspaces |
| Service and headless Service | Port 8000 and StatefulSet network identity                                  |
| ServiceAccount               | Pod identity; optional cluster permissions                                  |
| Ingress                      | Optional HTTP(S) entrypoint                                                 |

The default PVC mounts `/home/openhands/.openhands` and `/home/openhands/workspace` through separate subpaths. Both use the same disk. The image uses UID/GID 10001; the chart's pod security context matches that identity.

Use `persistence.existingClaim` for a managed PVC or adjust `persistence.mounts`, `size` and `storageClassName`. Retain the encryption key when restoring encrypted state. `config.automationDbUrl` can point Automation to an external database; that setting alone does not make the Agent Server safely replicated.

## Supply stable keys

Create a Kubernetes Secret containing your session and encryption keys, then reference it from an override file:

```yaml
secrets:
  sessionApiKey:
    existingSecret: praxis-keys
    key: sessionApiKey
  ohSecretKey:
    existingSecret: praxis-keys
    key: ohSecretKey
```

Apply it with `-f your-values.yaml` in the install command. The encryption key must match existing encrypted PVC contents. API-key authentication protects backend requests; the chart does not add per-user roles or tenant isolation.

## Remote access

Configure `ingress.enabled`, `className`, `hosts` and `tls` for your domain. Preserve WebSocket upgrades and suitable proxy timeouts for long conversations. Use HTTPS or a private network, with the authentication configuration in [self-hosting](../../docs/SELF_HOSTING.md). API access lets agents execute commands in their workspace.

## Optional Kubernetes permissions

RBAC bindings are disabled by default. `rbac.enabled=true` grants the pod ServiceAccount the built-in `admin` role in the existing namespaces listed in `rbac.namespaces`. `rbac.clusterAdmin=true` grants cluster-wide administration. These are agent infrastructure permissions, not frontend user roles; scope them to what the agent actually needs.

Additional environment variables can be supplied through `config.extraEnv`, including `valueFrom.secretKeyRef`. Inspect [values.yaml](values.yaml) for all chart settings.

## Uninstall

```sh
helm uninstall praxis
```

PVCs created by the StatefulSet are retained by default. Remove them explicitly only when you intend to delete stored state. The chart exposes `statefulSet.persistentVolumeClaimRetentionPolicy` for clusters supporting that setting.
