---
name: release
description: Prepare and verify a Praxis release, align version files, dispatch Praxis Release explicitly, and inspect the native archive and multi-architecture Docker image.
---

# Praxis release procedure

Read [the release policy](../../docs/policies/RELEASE.md) and
[distribution instructions](../../docs/distribution/README.md) before preparing a
release. Use `.github/workflows/praxis-release.yml` as the executable workflow.

## Prepare the release commit

1. Choose the product version deliberately. The first Praxis release is 1.25.0;
   later releases follow semantic versioning. An upstream update does not decide
   the Praxis version or publish a release.
2. Align `PRAXIS_VERSION`, root `package.json`, root `package-lock.json` and
   `config/defaults.json` (`versions.agentCanvas`). Use npm to update package
   metadata and the lock together. Review the chart's `appVersion` and documented
   image pins. Keep Agent Server and Automation versions independent.
3. Review selected changes, compatibility, applicable CI and upstream provenance.
   Merge the approved preparation into `main` before dispatching publication.
4. Check that the version tag does not already exist. Do not move a released tag
   or overwrite an existing version with a different commit.

## Publish only when requested

A maintainer dispatches **Praxis Release** from `main` with `version` equal to
`PRAXIS_VERSION` and `confirm` equal to `RELEASE`. Obtain release authorization
from the user unless the current request already authorizes that release.
Ordinary pushes, PR merges, tags and upstream updates do not dispatch it.

The workflow checks out the selected commit, validates inputs, runs repository
checks, typecheck, lint, tests and builds, creates the native archive, and checks
Docker launch modes. It then calls `docker.yml` directly. Native amd64 and arm64
jobs use separate caches and produce digests; the merge job publishes one image
index at `ghcr.io/praxiss-lab/praxis:<version>`. Stable versions also update
`latest`. Finally, the workflow creates `v<version>` and the GitHub release with
the native `.tgz` archive and `image.txt`.

Keep the inherited native package identity inside the archive until a separately
reviewed package migration. Do not publish to the upstream npm namespace.
There is no automatic deployment to a laptop or VM.

## Verify publication

Inspect the completed run and its exact commit. Check the release tag, attached
archive, `image.txt`, image index and recorded digest. For example:

```bash
gh run list --repo Praxiss-Lab/Praxis --workflow praxis-release.yml --limit 3
gh release view v<version> --repo Praxiss-Lab/Praxis
docker buildx imagetools inspect ghcr.io/praxiss-lab/praxis:<version>
```

Treat `<version>` as a placeholder. Check both linux/amd64 and linux/arm64;
provenance/attestation descriptors can additionally appear as unknown/unknown.
Record actual runtime tests separately: registry metadata does not prove that an
application ran successfully. Use the agreed laptop/VM test plan when authorized.

## Desktop artifacts

Keep Linux, Windows and macOS desktop workflows for PR builds and manual builds.
The Praxis release is created with `GITHUB_TOKEN`; its `release` event does not
start those workflows. For desktop artifacts, dispatch each required workflow on
`v<version>` explicitly, review its output and test the installed artifacts.
Manual runs upload Actions artifacts; they do not attach them to the release.
Attach approved files separately when publication is authorized. See the release
policy for the supported artifacts and this limitation.

## Recover from failure

Inspect which stage failed before retrying. If verification failed, nothing has
been published. If image publication succeeded but GitHub release creation
failed, publication is partially complete: inspect GHCR and the recorded commit
before recovery. If the tag already exists, the verification job rejects another
normal dispatch. Do not delete or move tags as a routine retry procedure.
Never report a release as complete before its image and GitHub artifacts exist.
