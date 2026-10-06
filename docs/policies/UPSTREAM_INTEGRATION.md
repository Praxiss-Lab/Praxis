# Upstream Integration Policy

Status: FOUNDATION POLICY — initial version

Praxis treats OpenHands as an upstream source, not as an authority that can
modify Praxis automatically.

## Core invariant

```text
upstream
  ↓ fetch / inspect
integration branch
  ↓ review + verification
explicit decision
  ↓
Praxis main
```

There is no automatic upstream-to-`main` merge.

## Decision classes

Every material upstream change considered for Praxis should be classified as
one of:

- **ACCEPT** — integrate the upstream change substantially as-is.
- **PARTIAL** — integrate only the portions useful to Praxis.
- **ADAPT** — implement the intent using Praxis architecture instead of taking
  the upstream implementation directly.
- **SKIP** — intentionally do not integrate because it is irrelevant.
- **REJECT** — do not integrate because it conflicts with Praxis architecture,
  security, product direction, or operational requirements.

## Integration branches

Significant upstream adoption should use a branch such as:

`integration/upstream-<release-or-date>`

The branch exists to make conflicts, behavioral changes, and compatibility
effects visible before they reach `main`.

## Merge requirements

Before an upstream integration reaches `main`:

1. identify the upstream commit/release/PR being integrated;
2. inspect the affected Praxis areas;
3. resolve conflicts intentionally rather than mechanically;
4. run the applicable build, typecheck, lint, unit, integration, and E2E gates;
5. run Praxis-specific compatibility/smoke tests when relevant;
6. update upstream tracking documentation;
7. review release/deployment impact.

Passing upstream CI alone is not sufficient evidence that a change is safe for
Praxis.

## Selective integration

Praxis may use normal merges, cherry-picks, or a clean reimplementation of an
upstream change. The chosen mechanism is secondary to preserving semantics,
traceability, and verification.

## No forced parity

Praxis is not required to stay feature-identical to OpenHands.

Once Praxis intentionally diverges in an area, later upstream changes to that
area must be evaluated against Praxis ownership and architecture rather than
blindly replayed.

## Security rule

Changes that affect authentication, secrets, runtime execution, workspace
boundaries, Docker/container behavior, filesystem access, network exposure, or
automation authority require explicit security-impact review before merge.
