# Praxis Post-Merge Verification

Recorded: 2026-10-06

Baseline under verification:

`main@a7a89c495a9fb105e2a6c42c9423cc51d7b83e39`

## Verified on main

### Praxis CI

Run: `37453687805`

Result: **SUCCESS**

This verifies the Praxis-owned automatic CI on the merged Foundation state.

### Praxis Smoke

Run: `37453687808`

Result: **SUCCESS**

This verifies the repository's Praxis smoke path on the merged Foundation
state.

### Docker / GHCR

Run: `37453688064`

Result: **SUCCESS**

This verifies that the merged Foundation state can build and publish the Praxis
container pipeline to the Praxis GHCR namespace.

### SDK Version Sync

Run: `37453687917`

Result: **SUCCESS**

The retained SDK consistency check passed on the merged Foundation state.

## E2E under investigation

### Mock-LLM browser E2E

Initial main run: `37453687970`

First attempt result: **FAILURE**

Observed:

- 73 tests executed;
- 8 failed;
- failures were spread across automation, cross-backend navigation,
  conversation execution, image upload, files/git, onboarding, profile
  management, and skills;
- most failures were timeouts, missing expected UI elements, or expected
  conversation/tool completion not being observed.

Because the failures were broad rather than concentrated around one Praxis
Foundation code change, the exact failed workflow was rerun without code
changes.

Classification remains:

`IN_VERIFICATION`

until the rerun completes.

### Mock-LLM Docker E2E

Run: `37454500619`

Status at time of this record: **IN PROGRESS**

This run validates the published Praxis container rather than only the npm/local
stack path.

## Remaining Foundation runtime evidence

After E2E classification, the remaining major external evidence is:

1. configure final `main` protection/required checks;
2. deploy an immutable Praxis image to the target VM;
3. run target-VM runtime smoke verification;
4. perform and verify rollback;
5. finalize the initial post-Foundation development roadmap.

No `FOUNDATION_READY` declaration is allowed before those required gates are
resolved.


## Upstream baseline comparison

The exact OpenHands baseline was checked directly.

- upstream browser Mock-LLM E2E run `37418681772`: FAILURE, 7 failing scenarios;
- upstream Docker Mock-LLM E2E run `37419222494`: FAILURE, 6 failing scenarios;
- Praxis Docker Mock-LLM E2E run `37454500619`: reproduced the same six Docker scenarios.

Detailed classification is recorded in
`UPSTREAM_BASELINE_LIMITATIONS.md`.

This means a fully green inherited Mock-LLM suite is not a truthful property of
the selected upstream baseline. Praxis therefore tracks non-regression relative
to baseline separately from Praxis-owned CI/smoke verification.


### Browser Mock-LLM rerun result

Praxis run `37453687970`, attempt 2: **FAILURE**

The exact rerun completed with 6 failing scenarios. The extra cross-connect
timeout observed only on attempt 1 did not recur.

Compared with the upstream baseline's 7 failing scenarios, no new persistent
Praxis browser-E2E regression was detected.

Final classification:

`BASELINE_LIMITATION / NO_NEW_PERSISTENT_REGRESSION_DETECTED`
