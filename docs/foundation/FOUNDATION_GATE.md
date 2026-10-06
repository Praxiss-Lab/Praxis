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
| Praxis automatic CI | VERIFIED | main push runs `37453687805` and `37461832824` succeeded |
| Upstream compatibility CI | VERIFIED AS DESIGN | manual-only `.github/workflows/ci.yml` |
| Praxis GHCR target | VERIFIED | `ghcr.io/emilio-01-t/praxis` |
| Praxis-specific compatibility smoke tests | VERIFIED | main push runs `37453687808` and `37461832885` succeeded |
| Container build/publish evidence | VERIFIED | main push Docker runs `37453688064` and `37461832805` succeeded; latest immutable image `ghcr.io/emilio-01-t/praxis:sha-31754b2` |
| Mock-LLM browser E2E | BASELINE LIMITATION / NO NEW PERSISTENT REGRESSION DETECTED | upstream baseline run `37418681772` failed 7; Praxis run `37453687970` failed 8 on attempt 1 and 6 on exact rerun, with the extra cross-connect timeout not recurring |
| Mock-LLM Docker E2E | BASELINE LIMITATION / NO NEW REGRESSION DETECTED | Praxis run `37454500619` reproduced the same six failures as upstream baseline run `37419222494` |
| Deployment contract | VERIFIED AS DESIGN | `DEPLOYMENT_AND_ROLLBACK.md` + `VM_DEPLOYMENT_RUNBOOK.md`; immutable target and rollback procedure defined |
| Deploy Praxis build to target VM | PENDING / EXECUTION READY | runbook, immutable image and evidence ledger prepared; requires target VM terminal access |
| Runtime smoke test on target VM | PENDING / EXECUTION READY | deterministic checklist prepared in `VM_DEPLOYMENT_RUNBOOK.md` and evidence ledger |
| Rollback test | PENDING / EXECUTION READY | pre-state, runtime and rollback verification helpers prepared under `scripts/praxis/` |
| Praxis release automation | VERIFIED | explicit `praxis-release.yml` plus static contract test validated by PR #3 Praxis CI |
| Main protection / required checks | PENDING | repository rules must be configured after final CI check names are stable |
| Initial development roadmap | VERIFIED / INITIAL ORDER ACCEPTED | `INITIAL_DEVELOPMENT_ROADMAP.md`; relevant AC items are re-evaluated only when each roadmap area begins |

## Bootstrap merge completed

Foundation PR #2 was merged into `main` as commit
`a7a89c495a9fb105e2a6c42c9423cc51d7b83e39`.

The inherited `pull_request_target` failures seen on the bootstrap PR are
historical transition evidence. The disabled Praxis definitions are now present
on `main` and govern future pull requests.

Post-merge runtime verification continues on this ledger.

## Exit condition

Only after every required PENDING/IN VERIFICATION item above is resolved may
this document be changed to:

```text
Status: FOUNDATION_READY
PROGRAMMING_START = ALLOWED
```
