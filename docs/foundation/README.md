# Praxis Fork Foundation

Status: FOUNDATION_READY — closed 2026-10-06

Praxis is being established as an independently maintained MIT-licensed fork
of OpenHands. The purpose of the Foundation Phase is to make the fork stable,
auditable, testable, deployable, and safe to evolve before structural product
development begins.

The owner accepted repository setup and local laptop operation as the closure
scope. VM execution, rollback and main protection are deferred follow-ups, not
verified prerequisites. See `LOCAL_RUNTIME_EVIDENCE.md` and `EXTERNAL_GATES.md`.

## Foundation objectives

The Foundation Phase establishes:

- an exact upstream baseline;
- a controlled upstream-integration workflow;
- independent Praxis versioning and release policy;
- CI and compatibility gates;
- container build and publication owned by Praxis;
- a reproducible deployment path;
- rollback expectations;
- licensing and attribution;
- engineering and contribution policy;
- documentation for maintenance continuity.

## Boundary

This phase does **not** redesign Workspace/Project ownership, conversation
lifecycle, Docker ownership, skills, profiles, automation semantics, or runtime
enforcement. Those belong to later product-development phases.

Existing architectural findings may be retained as backlog context, but they
are not Foundation Gate prerequisites.

## Foundation documents

- `FOUNDATION_GATE.md` — authoritative readiness ledger.
- `LOCAL_RUNTIME_EVIDENCE.md` — executed local checks and operator confirmations.
- `EXTERNAL_GATES.md` — explicitly deferred operational follow-ups.
- `INITIAL_DEVELOPMENT_ROADMAP.md` — revisable initial development proposal.
- `WORKFLOW_AUDIT.md` — inherited Actions classification.
- `ACTION_MIGRATION_LOG.md` — concrete automation migration history and transitional failures.
- `BRANDING_AND_COMPATIBILITY.md` — Praxis branding vs inherited technical identifiers.
- `DEPLOYMENT_AND_ROLLBACK.md` — target VM deployment/rollback contract.

Policies:

- `../policies/ENGINEERING.md`
- `../policies/UPSTREAM_INTEGRATION.md`
- `../policies/VERSIONING.md`
- `../policies/RELEASE.md`

Upstream continuity:

- `../upstream/BASELINE.md`
- `../upstream/SYNC_LOG.md`

## Bootstrap sequencing

The Foundation is intentionally completed in two stages.

### Stage A — bootstrap merge

The current Foundation bootstrap establishes Praxis-owned governance,
automation boundaries, CI, registry namespace, release policy, and tracking
mechanisms.

This stage may still show failures from inherited OpenHands
`pull_request_target` workflows because GitHub executes those workflow
definitions from the current base branch. Those failures are documented and
are not treated as Praxis product evidence.

Stage A can merge only after the new Praxis-owned CI and container pipeline
have produced acceptable evidence.

### Stage B — original post-merge plan (revised at closure)

After Stage A lands on `main`:

1. inherited base-branch PR automation is no longer authoritative;
2. main-branch Praxis CI is observed;
3. Praxis container publication is observed;
4. retained mock/runtime E2E workflows are observed;
5. repository protection rules are configured against the final Praxis check names;
6. the Praxis image is deployed to the target VM;
7. runtime smoke and rollback behavior are verified;
8. the initial product-development roadmap is accepted.

The original plan above included VM, rollback and branch protection. On
2026-10-06 the owner revised the exit scope: repository verification plus
basic application operation and restart persistence on the laptop suffice.
Those three operational items remain DEFERRED, with their procedures retained.

## Foundation Gate

Structural product development begins only after the repository can truthfully
declare `FOUNDATION_READY`.

The authoritative status is maintained in `FOUNDATION_GATE.md`.
