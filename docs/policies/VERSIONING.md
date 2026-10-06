# Praxis Versioning Policy

Status: active

Praxis continues the OpenHands Agent Canvas version line, starting at `1.25.0`.
Its release schedule remains independently maintained.

## Two version axes

Praxis tracks two different facts:

1. **Praxis version** — the version of the independently maintained fork.
2. **Upstream baseline** — the OpenHands commit/release from which the current Praxis state derives.

They must never be conflated.

## Praxis version source

The Praxis product version is stored in `PRAXIS_VERSION`. The first release is
`1.25.0`, matching the Agent Canvas source baseline; packaging work alone does
not increment it.

Keep `package.json`, the root package versions in `package-lock.json`, and
`config/defaults.json` (`versions.agentCanvas`) aligned with this version.
The inherited npm package name and binary remain unchanged. Agent Server and
Automation versions are dependency pins, not the Praxis release version.

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
