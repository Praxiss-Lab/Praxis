# GitHub Actions Migration Log

Recorded: 2026-10-06

This log records the migration of inherited OpenHands GitHub Actions into an
independently controlled Praxis automation surface.

## Why this exists

A GitHub fork inherits workflow files, but it does not inherit the upstream
organization's secrets, bot identities, package ownership, cross-repository
permissions, release policy, or operational authority.

Therefore, an inherited workflow is not automatically a valid Praxis workflow.

The Foundation rule is:

```text
inherited workflow
→ inspect authority + secrets + targets + side effects
→ KEEP / ADAPT / MANUAL / DISABLE
→ verify
→ only then treat it as Praxis automation
```

## Current classification

| Workflow | Praxis status | Reason |
| --- | --- | --- |
| `praxis-ci.yml` | PRAXIS / AUTOMATIC | Praxis-owned build, typecheck, lint, unit, app/library build and foundation checks |
| `ci.yml` | MANUAL | Retained as an explicit upstream-compatibility check; no longer automatic |
| `ci-script-tests.yml` | KEEP | Tests repository CI helper scripts when those scripts change |
| `docker.yml` | ADAPTED | Publishes to `ghcr.io/emilio-01-t/praxis`; same-repo PR detection fixed for a repository that is itself a GitHub fork |
| `sdk-version-sync.yml` | ADAPTED | No scheduled or repository-dispatch upstream control; PR/push/manual consistency checks retained |
| `mock-llm-e2e.yml` | KEEP / VERIFY | Useful local/mock E2E; retained for post-merge verification |
| `mock-llm-docker-e2e.yml` | KEEP / VERIFY | Validates published Praxis container after Docker workflow |
| `desktop-linux.yml` | KEEP / LATER POLICY | Build capability retained; official artifact policy not yet accepted |
| `desktop-macos.yml` | KEEP / LATER POLICY | Build capability retained; official artifact policy not yet accepted |
| `desktop-windows.yml` | KEEP / LATER POLICY | Build capability retained; official artifact policy not yet accepted |
| `bump-chart.yml` | DISABLED | Mutates OpenHands Cloud chart repository |
| `npm-publish.yml` | DISABLED | Would publish the inherited upstream npm package identity |
| `pr.yml` | DISABLED | Depends on OpenHands release-actions policy |
| `release-ready.yml` | DISABLED | OpenHands release/Slack integration |
| `release.yml` | DISABLED | OpenHands release automation; Praxis release process will be independent |
| `pr-artifacts.yml` | DISABLED | Write-capable OpenHands bot flow not yet adopted by Praxis |
| `pr-description-check.yml` | DISABLED | Upstream contribution gate requires OpenHands-specific issue/readiness semantics |
| `issue-duplicate-checker.yml` | DISABLED | Depends on OpenHands Cloud/API and upstream issue policy |
| `remove-duplicate-candidate-label.yml` | DISABLED | Depends on inherited issue-triage semantics |
| `update-debian-snapshot.yml` | DISABLED | Scheduled write automation uses OpenHands-specific bot credentials |

## Important transitional behavior on Foundation PR #2

The current Foundation PR was opened while `main` still contained the
original OpenHands `pull_request_target` workflows.

GitHub deliberately executes `pull_request_target` workflow definitions from
the **base branch**, not from untrusted PR code. Therefore changes that disable
`pr.yml`, `pr-description-check.yml`, and `pr-artifacts.yml` on the
Foundation branch cannot stop the already inherited base-branch versions from
running against this same PR.

As a result, PR #2 may continue to show legacy OpenHands check failures until
the Foundation workflow changes are merged into `main`.

Observed legacy failures included:

- PR title gate rejecting the non-Conventional-Commit prefix `Foundation:`;
- PR description gate requiring the OpenHands `HUMAN:` / `AGENT:` template,
  linked `ready-for-dev` issue, and other upstream contribution semantics.

These failures are **transitional inherited-governance failures**, not evidence
that the Praxis application build is broken.

## Praxis CI correction discovered during migration

The first Praxis CI attempt called `npm run typecheck` before generating the
i18n declaration file and failed with repeated:

`Cannot find module '#/i18n/declaration'`

The workflow was corrected to run:

`npm run make-i18n`

before typechecking. This is now part of the Praxis CI sequence.

## Docker fork-specific correction

The inherited Docker workflow used:

`!github.event.pull_request.head.repo.fork`

to distinguish trusted same-repository PRs from external fork PRs.

That predicate is invalid for Praxis because **Praxis itself is a GitHub fork**,
so even a branch inside `Emilio-01-T/Praxis` has `repo.fork == true`.

Praxis instead checks whether:

`github.event.pull_request.head.repo.full_name == github.repository`

This preserves the security intent: external PRs cannot authenticate for GHCR
publication, while trusted branches inside Praxis can exercise the container
pipeline.

## Registry ownership

Praxis container publication is now directed to:

`ghcr.io/emilio-01-t/praxis`

The default Agent Canvas image reference in `config/defaults.json` is also
migrated to that Praxis namespace.

OpenHands Agent Server and other upstream dependencies remain upstream
dependencies until Praxis deliberately decides otherwise.

## Rule going forward

No inherited workflow becomes authoritative merely because it exists in the
fork. Automation authority must be explicitly accepted by Praxis and recorded
here or in a successor policy document.


## Verified container publication evidence

GitHub Actions Docker run `37444356264` successfully completed the Praxis
multi-architecture publication path for the Foundation branch:

- amd64 build/push: success;
- arm64 build/push: success;
- multi-arch manifest merge: success;
- consolidated build information: success;
- PR image metadata update: success.

Verified image namespace:

`ghcr.io/emilio-01-t/praxis`

The inherited PR-summary generator initially still displayed the OpenHands GHCR
package hyperlink even though the actual image value was already Praxis. The
workflow was corrected so future summaries link to the Praxis package page.
