# External Foundation Gates

Status: DEFERRED — not blocking Foundation closure

The owner deferred these operational follow-ups on 2026-10-06 after accepting
local laptop verification. They do not block the agreed Foundation closure.
Procedures below are retained for later execution; no deferred gate is verified.

## Gate 1 — Main protection

Required repository administration action:

- create a ruleset targeting `main`;
- require pull requests before merge;
- require:
  - `Praxis Core Verification`
  - `Praxis Frontend Runtime Smoke`;
- require branches to be up to date;
- block force pushes;
- block deletion.

Procedure:

`docs/foundation/MAIN_PROTECTION.md`

Completion evidence:

- ruleset visible through GitHub;
- a test PR is blocked until required checks pass.

Status:

`DEFERRED_BY_OWNER — NOT ACTIVATED`

## Gate 2 — Target VM deployment / smoke / rollback

Immutable Foundation target:

`ghcr.io/emilio-01-t/praxis:sha-31754b2`

Expected multi-arch digest:

`sha256:35b887a4cbdda60c25131a55077ea398b19978337093e24779c2caf285d78707`

Procedure:

`docs/foundation/VM_DEPLOYMENT_RUNBOOK.md`

Evidence ledger:

`docs/foundation/VM_DEPLOYMENT_EVIDENCE.md`

Helper scripts:

- `scripts/praxis/vm-record-state.sh`
- `scripts/praxis/vm-verify-runtime.sh`
- `scripts/praxis/vm-verify-rollback.sh`

Completion requires:

1. record pre-deploy state;
2. deploy immutable Praxis image;
3. verify container identity;
4. run real runtime smoke;
5. prove rollback;
6. redeploy Praxis;
7. commit executed evidence.

Status:

`DEFERRED_BY_OWNER — NOT EXECUTED`

## Foundation closure and later completion

Foundation is closed for repository setup plus local basic runtime verification.
See `FOUNDATION_GATE.md` and `LOCAL_RUNTIME_EVIDENCE.md`.

When these follow-ups are resumed, mark them VERIFIED only after executing
their checks and recording evidence. Readiness for production deployment is a
separate assessment; the local test must not be represented as VM execution.
