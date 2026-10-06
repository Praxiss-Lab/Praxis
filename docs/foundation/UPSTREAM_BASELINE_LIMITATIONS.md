# Upstream Baseline E2E Limitations

Recorded: 2026-10-06

Praxis baseline:

`OpenHands/OpenHands@81e83760a196ba6374ad2c3d38d577262c79ca2d`

Praxis bootstrap main:

`Emilio-01-T/Praxis@a7a89c495a9fb105e2a6c42c9423cc51d7b83e39`

## Purpose

Praxis must distinguish failures introduced by the fork from failures already
present in the exact OpenHands baseline it forked from.

A failing inherited test is not automatically a Praxis regression.

## Browser Mock-LLM E2E

### OpenHands baseline evidence

Upstream run: `37418681772`

Result: **FAILURE**

The upstream baseline executed 73 tests and reported 7 failures:

1. preset automation slash-command conversation;
2. conversation step 3 / mock-LLM execution;
3. image upload;
4. files/git workspace metadata;
5. onboarding response;
6. same-model profile identity;
7. project skill trigger.

### Praxis first main attempt

Praxis run: `37453687970`, attempt 1

Result: **FAILURE**

The same seven upstream failures were observed, plus one additional
cross-connect navigation timeout.

An exact rerun with no code change completed as attempt 2 of run
`37453687970`.

Attempt 2 reported 6 failures:

1. preset automation slash-command conversation;
2. conversation step 3 / mock-LLM execution;
3. image upload;
4. onboarding response;
5. same-model profile identity;
6. project skill trigger.

The additional cross-connect timeout from attempt 1 did **not** recur. The
files/git scenario that failed upstream and on Praxis attempt 1 also passed on
attempt 2.

Classification:

`BASELINE_LIMITATION_CONFIRMED; NO_NEW_PERSISTENT_BROWSER_E2E_REGRESSION_DETECTED`

## Docker Mock-LLM E2E

### OpenHands baseline evidence

Upstream run: `37419222494`

Result: **FAILURE**

Observed failures:

1. automation lifecycle;
2. preset automation slash-command conversation;
3. conversation profile creation;
4. conversation execution;
5. image upload;
6. onboarding response.

### Praxis evidence

Praxis run: `37454500619`

Result: **FAILURE**

Praxis reproduced the same six failing scenarios on the published Praxis image.

Classification:

`NO_NEW_DOCKER_E2E_REGRESSION_DETECTED_RELATIVE_TO_BASELINE`

## Foundation interpretation

The Foundation does not claim that the inherited OpenHands E2E suite is fully
green.

Instead it records a precise baseline comparison:

- Praxis-owned CI: green;
- Praxis smoke: green;
- Praxis Docker build/publish: green;
- inherited browser/Docker Mock-LLM E2E failures: reproduced on the exact
  upstream baseline.

These upstream failures remain visible technical debt and may be addressed
later through targeted product work or by integrating upstream fixes.

They must not be silently converted into `VERIFIED`.
