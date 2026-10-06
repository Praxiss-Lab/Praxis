# Target VM Deployment Evidence

Status: NOT EXECUTED

Fill this record only from observed execution on the target VM.

## Target

- VM:
- execution date/time UTC:
- operator:
- Compose directory:
- application service:
- application container:

## Pre-deploy state

- configured image:
- image ID:
- container status:
- persistent mount set recorded: YES / NO
- pre-deploy state file:
- Compose backup created: YES / NO

## Praxis target

- commit: `31754b2c0944e916dbeda50166940a9395e4936e`
- image: `ghcr.io/emilio-01-t/praxis:sha-31754b2`
- expected multi-arch digest:
  `sha256:35b887a4cbdda60c25131a55077ea398b19978337093e24779c2caf285d78707`
- resolved digest observed on VM:
- pull result: PASS / FAIL

## Deployment

- only application image changed: PASS / FAIL / UNKNOWN
- Compose config rendered successfully: PASS / FAIL
- only application service recreated: PASS / FAIL
- resulting configured image:
- resulting image ID:
- container running: PASS / FAIL
- runtime verification script: PASS / FAIL

## Runtime smoke

| Check | Result | Evidence / note |
| --- | --- | --- |
| Authenticated Praxis UI loads | UNKNOWN | |
| `Software_Engineer` profile present | UNKNOWN | |
| Memory present | UNKNOWN | |
| Required User Skills/config present | UNKNOWN | |
| Conversation starts | UNKNOWN | |
| Isolated Docker/Sysbox path works | UNKNOWN | |
| Project container operation works | UNKNOWN | |
| Preview Gateway works | UNKNOWN | |
| Restart preserves expected state | UNKNOWN | |

## Rollback proof

- previous image restored: PASS / FAIL / UNKNOWN
- application running after rollback: PASS / FAIL / UNKNOWN
- persistent mount set unchanged: PASS / FAIL / UNKNOWN
- UI/runtime restored: PASS / FAIL / UNKNOWN
- `vm-verify-rollback.sh`: PASS / FAIL / NOT RUN

## Final state after rollback proof

- Praxis redeployed: YES / NO
- final configured image:
- final image ID:
- final runtime smoke: PASS / FAIL / NOT RUN

## Limitations / incidents

Record any issue encountered without including secrets.

## Final classification

- Deploy Praxis build to target VM:
  `PENDING`
- Runtime smoke test on target VM:
  `PENDING`
- Rollback test:
  `PENDING`

Do not change these to `VERIFIED` without executed evidence.
