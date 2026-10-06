# Praxis Release Policy

Status: active

Praxis continues the Agent Canvas version line, starting at `1.25.0`.
Release publication remains independent from OpenHands.

## Source of version truth

The Praxis product version is stored in:

`PRAXIS_VERSION`

Keep the native package version in `package.json` / `package-lock.json` and
`versions.agentCanvas` in `config/defaults.json` aligned with `PRAXIS_VERSION`.
Agent Server and Automation retain their own dependency versions.

## Release tag

A Praxis release uses:

`v<PRAXIS_VERSION>`

Examples:

- `v1.25.0`
- `v1.25.1`
- `v1.26.0-alpha.1`

## Release authority

A release is never created automatically merely because OpenHands publishes a
new version or because an upstream integration lands.

The release workflow is explicitly dispatched by a maintainer and requires the
requested version to match `PRAXIS_VERSION`.

## Pre-release behavior

Any version containing a hyphen is treated as a pre-release.

Stable releases are versions without pre-release metadata.

## Verification before release

The release workflow must run the repository static checks and core
application verification before creating a tag/release.

After verification, the release workflow calls the reusable Docker workflow
directly for the same exact commit. Image publication completes before GitHub
Release creation; no tag-event cascade is required. The registry target is:

`ghcr.io/emilio-01-t/praxis`

## Upstream relationship

The release notes and upstream sync log should identify material OpenHands
changes adopted since the previous Praxis release.

The first Praxis release retains the source baseline version `1.25.0`. Future
Praxis versions follow semantic versioning; an upstream release does not
automatically publish or advance Praxis.

## Published artifacts

Each release builds amd64 and arm64 in parallel on native runners, using
separate BuildKit cache scopes. Architecture results are pushed by digest without
architecture tags; a dependent job combines their exact digests into one
multi-architecture image tagged with the Praxis version. Stable releases additionally update `latest`. No PR, branch, SHA
or architecture-suffixed package tags are published. `main` pushes only validate.
The image supports complete, backend-only and frontend-only launch modes.

The release attaches the native npm archive and `image.txt` containing the source
commit and image digest. The inherited package identity is retained inside the
archive; there is no publication to the upstream npm namespace.

Publication is sequential, not transactional: if GitHub Release creation fails
after GHCR publication, inspect the existing image before retrying. Do not move
a released version tag to a different commit. See
[distribution](../distribution/README.md) for commands and workflow responsibilities.
