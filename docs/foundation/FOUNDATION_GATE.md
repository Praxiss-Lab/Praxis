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
| Praxis automatic CI | VERIFIED | main push run `37453687805` succeeded |
| Upstream compatibility CI | VERIFIED AS DESIGN | manual-only `.github/workflows/ci.yml` |
| Praxis GHCR target | VERIFIED | `ghcr.io/emilio-01-t/praxis` |
| Praxis-specific compatibility smoke tests | VERIFIED | main push run `37453687808` succeeded |
| Container build/publish evidence | VERIFIED | main push Docker run `37453688064` succeeded after PR verification run `37444356264` |
| Mock-LLM browser E2E | IN VERIFICATION / BASELINE LIMITATION | upstream baseline run `37418681772` already fails the same 7 core scenarios; Praxis rerun is classifying one additional first-attempt timeout |
| Mock-LLM Docker E2E | BASELINE LIMITATION / NO NEW REGRESSION DETECTED | Praxis run `37454500619` reproduced the same six failures as upstream baseline run `37419222494` |
| Deployment contract | VERIFIED AS DESIGN | `DEPLOYMENT_AND_ROLLBACK.md` |
| Deploy Praxis build to target VM | PENDING | requires target VM execution |
| Runtime smoke test on target VM | PENDING | requires target VM execution |
| Rollback test | PENDING | requires target VM execution |
| Praxis release automation | PENDING | independent release automation still to be implemented |
| Main protection / required checks | PENDING | repository rules must be configured after final CI check names are stable |
| Initial development roadmap | PENDING | define after Foundation infrastructure is stable |

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
