# Praxis Fork Foundation

Praxis is an independent MIT-licensed fork of OpenHands focused on a stable,
controlled development environment for AI-driven software engineering.

This document tracks the foundation work that must be completed before
structural product development begins.

## Foundation objective

Praxis must be able to evolve independently while continuing to observe,
review, selectively integrate, adapt, or reject changes from the upstream
OpenHands repository.

Upstream changes must never flow automatically into Praxis `main`.

## Foundation phases

1. Fork and baseline
2. Licensing and attribution
3. Upstream remote/integration model
4. Branch strategy
5. Upstream review tooling
6. CI baseline
7. Build/test baseline
8. Praxis container image pipeline
9. Deployment baseline
10. Rollback verification
11. Engineering and upstream policies
12. Foundation verification

The structural backlog for future Praxis behavior is intentionally **not** a
prerequisite for this foundation. Architecture issues are re-evaluated only
when the corresponding development phase begins.

## Branch model

- `main` — stable Praxis branch; should remain buildable and deployable.
- `feature/*` — product changes.
- `fix/*` — bug fixes.
- `refactor/*` — structural refactors.
- `integration/upstream-*` — temporary upstream evaluation branches.
- `foundation/*` — foundation-only work before the initial gate is complete.

A permanent `develop` branch is not required.

## Foundation gate

Structural product development starts only after the project can declare:

`FORK_FOUNDATION_READY`

Expected evidence:

- fork relationship to OpenHands is verified;
- upstream baseline is recorded;
- MIT licensing/attribution is correct;
- upstream integration policy is accepted;
- CI runs successfully on Praxis;
- the unmodified fork builds and passes the selected baseline tests;
- Praxis-owned container publishing is working;
- the Praxis image can be deployed in the target environment;
- rollback to the previous image/version is verified;
- engineering/development policy is accepted;
- the initial development roadmap is accepted.

Until then, work is foundation work rather than structural product development.
