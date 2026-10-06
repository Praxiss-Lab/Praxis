# Praxis Engineering Policy

Status: FOUNDATION POLICY — initial version

## Principle

Praxis `main` is the product source of truth. Changes reach `main` only after the applicable engineering evidence exists.

## Change flow

For non-trivial work:

```text
problem / requirement
→ design decision where needed
→ implementation branch
→ tests and evidence
→ review
→ merge
→ release/deploy when appropriate
```

## Branches

Use short-lived branches:

- `foundation/*` — fork-foundation work;
- `feature/*` — product functionality;
- `fix/*` — bug fixes;
- `refactor/*` — behavior-preserving restructuring;
- `integration/upstream-*` — deliberate upstream adoption.

Long-lived divergence branches are discouraged. `main` should remain deployable.

## Required verification

Depending on the affected boundary, changes may require typecheck, lint, unit tests, build, integration tests, browser/E2E tests, container build, Praxis compatibility smoke tests, and security-impact review.

A green upstream test suite is useful evidence but is not sufficient proof that a change preserves Praxis-specific contracts.

## High-risk changes

Changes affecting authentication, authorization, secrets, filesystem/workspace boundaries, process/container execution, Docker/runtime ownership, network exposure, persistence/state migration, automation authority, or upstream compatibility strategy require explicit impact review.

## Documentation

Material changes must assess documentation impact and update only the affected documents.

## Upstream changes

All OpenHands integrations follow `docs/policies/UPSTREAM_INTEGRATION.md`. There is no automatic upstream-to-`main` merge.
