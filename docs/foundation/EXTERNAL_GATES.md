# External Foundation Gates

Status: OPEN

This file tracks the remaining Praxis Foundation work that cannot be completed
from repository write access alone.

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

`PENDING_EXTERNAL_ADMIN_ACCESS`

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

`PENDING_REMOTE_TERMINAL_ACCESS`

## Foundation exit condition

When both gates are VERIFIED, update:

`docs/foundation/FOUNDATION_GATE.md`

to:

```text
Status: FOUNDATION_READY
PROGRAMMING_START = ALLOWED
```

Do not declare Foundation ready based on documentation alone.
