# Praxis Release Policy

Status: FOUNDATION POLICY — initial version

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

Container publication is performed from the release tag by the Praxis-adapted
Docker workflow and targets:

`ghcr.io/emilio-01-t/praxis`

## Upstream relationship

The release notes and upstream sync log should identify material OpenHands
changes adopted since the previous Praxis release.

An OpenHands version number does not determine the Praxis version number.
