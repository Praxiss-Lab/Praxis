# Upstream Sync Log

This file records deliberate upstream-integration decisions for Praxis.

## Rules

- Fetching or observing upstream does not change Praxis.
- Upstream changes are never merged automatically into Praxis `main`.
- Material integrations are evaluated on an integration branch.
- Accepted changes must pass the applicable Praxis verification gates.
- Partial adaptations and rejected changes must be recorded when they matter
  to future maintainers.

## Entries

### 2026-10-06 — Initial fork baseline

- Upstream: `OpenHands/OpenHands`
- Upstream commit: `81e83760a196ba6374ad2c3d38d577262c79ca2d`
- Praxis commit: `81e83760a196ba6374ad2c3d38d577262c79ca2d`
- Decision: BASELINE
- Notes: Praxis was created as a public fork from the current upstream main.
