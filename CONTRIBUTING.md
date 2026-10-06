# Contributing to Praxis

Praxis is an independently maintained MIT-licensed fork of OpenHands.

## Before changing code

Read:

- `docs/policies/ENGINEERING.md`
- `docs/policies/UPSTREAM_INTEGRATION.md`
- `docs/upstream/BASELINE.md`

For Foundation work, also read:

- `docs/foundation/README.md`
- `docs/foundation/ACTION_MIGRATION_LOG.md`
- `docs/foundation/FOUNDATION_GATE.md`

## Branches

Use short-lived branches:

- `feature/*`
- `fix/*`
- `refactor/*`
- `integration/upstream-*`
- `foundation/*` while the Foundation Phase is active

## Pull requests

A pull request should explain:

1. why the change is needed;
2. what changed;
3. how it was verified;
4. any known limitations;
5. documentation or migration impact;
6. upstream provenance when the change comes from OpenHands.

## Verification

Run the checks appropriate to the change. The default Praxis CI includes
foundation invariants, generated i18n declarations, typecheck, lint, unit
tests, application build, library build, and package-content verification.

Additional integration, browser/E2E, container, security, migration, or runtime
checks are required when the affected boundary warrants them.

## Upstream contributions

Do not merge OpenHands changes directly into Praxis `main`.

Use the upstream integration process and record material decisions in
`docs/upstream/SYNC_LOG.md`.

## License

Contributions to Praxis are accepted under the MIT License.
