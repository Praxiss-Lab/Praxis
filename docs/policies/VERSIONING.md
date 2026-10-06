# Praxis Versioning Policy

Status: FOUNDATION POLICY — initial version

Praxis uses its own product version independently from the version published by OpenHands.

## Two version axes

Praxis tracks two different facts:

1. **Praxis version** — the version of the independently maintained fork.
2. **Upstream baseline** — the OpenHands commit/release from which the current Praxis state derives.

They must never be conflated.

## Praxis version source

During the Foundation Phase, the Praxis product version is stored in `PRAXIS_VERSION`.

Initial value: `0.1.0-dev`.

The inherited `package.json` version remains an upstream compatibility detail until packaging/publication is intentionally migrated to the Praxis namespace. This reduces unnecessary upstream merge conflicts during Foundation.

## Release semantics

Praxis follows semantic versioning for its own releases:

- PATCH — compatible fixes and maintenance;
- MINOR — backward-compatible functionality;
- MAJOR — intentionally breaking product/runtime contracts.

Pre-release identifiers such as `-dev`, `-alpha.N`, `-beta.N`, and `-rc.N` may be used before stable releases.

## Upstream adoption

Adopting a new OpenHands baseline does not automatically dictate a Praxis version number. The Praxis version is chosen based on the effect of the integration on Praxis.

## Tags

Praxis release tags use `v<PRAXIS_VERSION>`.

A tag represents a verified Praxis release, not merely an upstream sync point.
