# Inherited GitHub Actions Audit

Recorded: 2026-10-06

The OpenHands fork inherited upstream GitHub Actions. Praxis must not assume that workflows designed for the OpenHands organization are safe or meaningful for an independent fork.

## KEEP during Foundation

These workflows are useful as repository/build verification and do not inherently publish into the OpenHands organization:

- `ci-script-tests.yml`
- `ci.yml` — baseline build/test workflow; live-secret-dependent paths will be revisited before Foundation completion
- `desktop-linux.yml`
- `desktop-macos.yml`
- `desktop-windows.yml`
- `mock-llm-e2e.yml`
- `mock-llm-docker-e2e.yml`
- `pr-description-check.yml` — retained initially as an upstream-quality gate

## ADAPT

- `docker.yml`
  - publish target must be Praxis GHCR, never the OpenHands namespace
- `sdk-version-sync.yml`
  - scheduled/cross-repository upstream automation should not control Praxis automatically

## DISABLE pending Praxis replacement

These inherited workflows are organization-specific, publishing-capable, or write-capable and should not run automatically in Praxis until explicitly adapted:

- `bump-chart.yml`
- `npm-publish.yml`
- `pr.yml`
- `release-ready.yml`
- `release.yml`
- `pr-artifacts.yml`
- `issue-duplicate-checker.yml`
- `remove-duplicate-candidate-label.yml`
- `update-debian-snapshot.yml`

Reasons include OpenHands organization secrets, OpenHands Cloud, OpenHands release automation, npm publication of the upstream package, or write-capable automation not yet adopted by Praxis.

## Policy

Disabled inherited workflows are not considered deleted functionality. Their original implementations remain in Git history and can be selectively adapted later under the Upstream Integration Policy.

## Before FOUNDATION_READY

1. establish Praxis-native CI as the required merge gate;
2. verify Praxis GHCR publication;
3. add Praxis compatibility smoke tests;
4. establish Praxis release automation;
5. decide which desktop/release artifacts Praxis will officially publish.
