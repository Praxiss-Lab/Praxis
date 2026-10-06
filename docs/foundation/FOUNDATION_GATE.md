# Praxis Foundation Gate

Status: IN PROGRESS

This ledger is the authority for declaring the fork ready for structural
product development.

`FOUNDATION_READY` must not be declared until required evidence exists.

| Gate | Status | Evidence / note |
| --- | --- | --- |
| Public fork created | VERIFIED | `Emilio-01-T/Praxis`, fork of `OpenHands/OpenHands` |
| Exact upstream baseline recorded | VERIFIED | `docs/upstream/BASELINE.md` |
| MIT licensing preserved | VERIFIED | `LICENSE`, `NOTICE` |
| Independent Praxis version axis | VERIFIED | `PRAXIS_VERSION`, versioning policy |
| Upstream integration policy | VERIFIED | `docs/policies/UPSTREAM_INTEGRATION.md` |
| Upstream tracking scripts | VERIFIED | `scripts/praxis/upstream-*.sh` |
| Engineering policy | VERIFIED | `docs/policies/ENGINEERING.md` |
| Branding/compatibility boundary | VERIFIED | `docs/foundation/BRANDING_AND_COMPATIBILITY.md` |
| Inherited Actions audit | VERIFIED | `docs/foundation/ACTION_MIGRATION_LOG.md` |
| OpenHands organization write/publish workflows isolated | VERIFIED | disabled/manualized Foundation workflow changes |
| Praxis automatic CI | IN VERIFICATION | `.github/workflows/praxis-ci.yml` |
| Upstream compatibility CI | VERIFIED AS DESIGN | manual-only `.github/workflows/ci.yml` |
| Praxis GHCR target | VERIFIED | `ghcr.io/emilio-01-t/praxis` |
| Praxis-specific compatibility smoke tests | IN VERIFICATION | `scripts/praxis/smoke.sh` + `.github/workflows/praxis-smoke.yml` added; successful run pending |
| Container build/publish evidence | VERIFIED | Docker run `37444356264`: amd64 + arm64 build/push, multi-arch manifest, consolidation succeeded |
| Deployment contract | VERIFIED AS DESIGN | `DEPLOYMENT_AND_ROLLBACK.md` |
| Deploy Praxis build to target VM | PENDING | requires target VM execution |
| Runtime smoke test on target VM | PENDING | requires target VM execution |
| Rollback test | PENDING | requires target VM execution |
| Praxis release automation | PENDING | independent release automation still to be implemented |
| Main protection / required checks | PENDING | repository rules must be configured after final CI check names are stable |
| Initial development roadmap | PENDING | define after Foundation infrastructure is stable |

## Transitional PR note

Foundation PR #2 can still receive failures from inherited
`pull_request_target` workflows because those workflows execute from the
current base branch (`main`). Their disabled definitions on the Foundation
branch cannot take effect for that same PR.

This is documented in `ACTION_MIGRATION_LOG.md` and must not be confused with
Praxis CI/application failure.

## Exit condition

Only after every required PENDING/IN VERIFICATION item above is resolved may
this document be changed to:

```text
Status: FOUNDATION_READY
PROGRAMMING_START = ALLOWED
```
