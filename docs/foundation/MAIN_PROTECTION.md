# Main Protection Plan

Status: DEFERRED BY OWNER — not activated

Deferred on 2026-10-06; does not block the accepted Foundation closure scope.
The configuration below remains a future plan.

Praxis currently has no repository rulesets configured for `main`.

The connected GitHub integration available to this maintenance session can
inspect rulesets but cannot create or modify repository rulesets. Therefore
the final activation must be performed once in GitHub repository settings.

## Required checks

Require the following checks before merge:

- `Praxis Core Verification`
- `Praxis Frontend Runtime Smoke`

These checks have both passed on merged Foundation commit:

`a7a89c495a9fb105e2a6c42c9423cc51d7b83e39`

Evidence:

- Praxis CI run `37453687805`
- Praxis Smoke run `37453687808`

## Why Docker is not a universal required check

The Docker workflow is verified and publishes Praxis images successfully, but
it is not recommended as an unconditional branch-protection requirement for
every contributor PR because:

- it performs multi-architecture builds and GHCR publication;
- external fork PRs cannot receive trusted package-write credentials;
- requiring skipped/unavailable Docker jobs would make legitimate external
  contributions impossible to merge.

Docker remains mandatory evidence for release/container-affecting work through
engineering policy rather than a universal branch rule.

## Recommended main rules

Configure a branch ruleset targeting `main` with:

1. Require a pull request before merging.
2. Require status checks to pass.
3. Required checks:
   - `Praxis Core Verification`
   - `Praxis Frontend Runtime Smoke`
4. Require branches to be up to date before merging.
5. Block force pushes.
6. Block branch deletion.
7. Do not allow bypass except the repository owner for emergency recovery,
   if a bypass is desired at all.

A mandatory approval count is optional for the current single-maintainer phase.
It can be raised when additional maintainers join.

## Verification after configuration

After saving the ruleset:

1. confirm the ruleset is visible through the GitHub rulesets API;
2. open a trivial test PR;
3. verify merge is blocked until both required checks pass;
4. verify direct destructive operations remain blocked as configured.

Only then change the Foundation Gate entry for main protection to `VERIFIED`.
