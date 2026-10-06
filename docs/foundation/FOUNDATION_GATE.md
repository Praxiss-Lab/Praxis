# Praxis Foundation Gate

Status: FOUNDATION_READY
PROGRAMMING_START = ALLOWED

Closed: 2026-10-06

This ledger is the authority for declaring the fork ready for structural
product development.

Closure scope accepted by the owner on 2026-10-06: repository setup and basic
application operation on the local laptop. VM deployment, rollback proof and
main protection are explicitly deferred; they are not reported as verified.
This is readiness to begin development, not a production-readiness declaration.

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
| Praxis automatic CI | VERIFIED | main push run `37474386465` succeeded on `429e56a` (earlier runs also passed) |
| Upstream compatibility CI | VERIFIED AS DESIGN | manual-only `.github/workflows/ci.yml` |
| Praxis GHCR target | VERIFIED | `ghcr.io/emilio-01-t/praxis` |
| Praxis-specific compatibility smoke tests | VERIFIED | main push run `37474386481` succeeded on `429e56a` (earlier runs also passed) |
| Container build/publish evidence | VERIFIED | main push Docker runs `37461832805` and `37474386515` succeeded; locally tested image `ghcr.io/emilio-01-t/praxis:sha-31754b2` |
| Mock-LLM browser E2E | BASELINE LIMITATION / NO NEW PERSISTENT REGRESSION DETECTED | upstream baseline run `37418681772` failed 7; Praxis run `37453687970` failed 8 on attempt 1 and 6 on exact rerun, with the extra cross-connect timeout not recurring |
| Mock-LLM Docker E2E | BASELINE LIMITATION / NO NEW REGRESSION DETECTED | Praxis run `37454500619` reproduced the same six failures as upstream baseline run `37419222494` |
| Deployment contract | VERIFIED AS DESIGN | `DEPLOYMENT_AND_ROLLBACK.md` + `VM_DEPLOYMENT_RUNBOOK.md`; immutable target and rollback procedure defined |
| Local laptop container deployment | VERIFIED | `LOCAL_RUNTIME_EVIDENCE.md`: pinned digest pulled and container started |
| Local HTTP/application smoke | VERIFIED | HTTP outputs plus operator-confirmed UI/profile/conversation checks in `LOCAL_RUNTIME_EVIDENCE.md` |
| Local restart persistence | VERIFIED | backend recovered; operator confirmed retained profile/conversation and a new response |
| Deploy Praxis build to target VM | DEFERRED | owner decision, 2026-10-06; VM not tested |
| Runtime smoke test on target VM | DEFERRED | local smoke completed; no VM/runtime-isolation or Preview Gateway claim |
| Rollback test | DEFERRED | not executed; procedures retained for later verification |
| Praxis release automation | VERIFIED | explicit `praxis-release.yml` plus static contract test validated by PR #3 Praxis CI |
| Main protection / required checks | DEFERRED | no active ruleset observed; owner postponed activation |
| Initial development roadmap | VERIFIED / INITIAL ORDER ACCEPTED | `INITIAL_DEVELOPMENT_ROADMAP.md`; relevant AC items are re-evaluated only when each roadmap area begins |

## Bootstrap merge completed

Foundation PR #2 was merged into `main` as commit
`a7a89c495a9fb105e2a6c42c9423cc51d7b83e39`.

The inherited `pull_request_target` failures seen on the bootstrap PR are
historical transition evidence. The disabled Praxis definitions are now present
on `main` and govern future pull requests.

Local runtime evidence and the accepted closure scope are recorded in
`LOCAL_RUNTIME_EVIDENCE.md`. Inherited E2E failures remain visible limitations.
The latest Docker E2E run `37474980288` was incomplete (20-minute timeout;
17 tests did not run); it is not full-suite non-regression evidence.

## Closure decision

The owner accepted the local verification and explicitly postponed additional
operational checks on 2026-10-06. The required repository and local-runtime
scope is complete. Deferred items are tracked in `EXTERNAL_GATES.md`;
future completion requires actual execution evidence.

```text
Status: FOUNDATION_READY
PROGRAMMING_START = ALLOWED
```

Product-specific acceptance criteria are evaluated in subsequent development.
The initial roadmap is a starting proposal and can be revised with the owner.
