# Praxis Release Policy

Status: active

Praxis releases are independent from OpenHands releases.

## Source of version truth

The Praxis product version is stored in:

`PRAXIS_VERSION`

The inherited Agent Canvas version in `package.json` remains upstream
compatibility metadata until Praxis intentionally migrates the package identity.

## Release tag

A Praxis release uses:

`v<PRAXIS_VERSION>`

Examples:

- `v0.1.0-dev`
- `v0.1.0-alpha.1`
- `v0.1.0`

## Release authority

A release is never created automatically merely because OpenHands publishes a
new version or because an upstream integration lands.

The release workflow is explicitly dispatched by a maintainer and requires the
requested version to match `PRAXIS_VERSION`.

## Pre-release behavior

Any version containing a hyphen is treated as a pre-release.

Stable releases are versions without pre-release metadata.

## Verification before release

The release workflow must run the Praxis Foundation/static checks and core
application verification before creating a tag/release.

After verification, the release workflow calls the reusable Docker workflow
directly for the same exact commit. Image publication completes before GitHub
Release creation; no tag-event cascade is required. The registry target is:

`ghcr.io/emilio-01-t/praxis`

## Upstream relationship

The release notes and upstream sync log should identify material OpenHands
changes adopted since the previous Praxis release.

An OpenHands version number does not determine the Praxis version number.

## Published artifacts

Each release publishes one multi-architecture amd64/arm64 image tagged with the
Praxis version. Stable releases additionally update `latest`. No PR, branch, SHA
or architecture-suffixed package tags are published. `main` pushes only validate.
The image supports complete, backend-only and frontend-only launch modes.

The release attaches the native npm archive and `image.txt` containing the source
commit and image digest. The inherited package identity is retained inside the
archive; there is no publication to the upstream npm namespace.

Publication is sequential, not transactional: if GitHub Release creation fails
after GHCR publication, inspect the existing image before retrying. Do not move
a released version tag to a different commit. See
[distribution](../distribution/README.md) for commands and workflow responsibilities.
