# Upstream Integration Policy

## Purpose

Praxis tracks OpenHands upstream without allowing upstream changes to modify the
Praxis stable branch automatically.

## Core rule

`upstream/main` is an observed source, not the Praxis source of truth.

Praxis `main` is the product source of truth.

## Required flow

```text
OpenHands upstream
        ↓ fetch
new commits / release / PRs
        ↓
review and classify
        ↓
integration/upstream-<identifier>
        ↓
build + tests + compatibility review
        ↓
ACCEPT / PARTIAL / ADAPT / SKIP / REJECT
        ↓
Praxis main
```

## Allowed decisions

- **ACCEPT** — integrate the upstream change as-is.
- **PARTIAL** — integrate only selected commits or portions.
- **ADAPT** — reimplement the intent in a Praxis-compatible way.
- **SKIP** — no value for Praxis at this time.
- **REJECT** — conflicts with Praxis architecture, policy, security, or product
  direction.

## Prohibited behavior

- automatic upstream merge into `main`;
- automatic deployment after upstream fetch;
- treating an upstream release as a Praxis release without review;
- resolving conflicts by discarding Praxis behavior without explicit approval;
- silently changing the recorded upstream baseline.

## Integration mechanics

Use an `integration/upstream-*` branch for material upstream updates.

Preferred mechanisms are chosen per change:

- merge when adopting a coherent upstream range and preserving ancestry matters;
- cherry-pick for isolated fixes;
- manual adaptation when Praxis architecture has diverged;
- no integration when the change is skipped/rejected.

## Required review before merge

At minimum evaluate:

- build compatibility;
- tests;
- runtime/API contract changes;
- workspace/conversation behavior;
- profiles/skills/tools;
- automations;
- Docker/runtime behavior;
- persistence/migrations;
- security implications;
- Praxis-specific changes that overlap the upstream diff.

Only affected areas need deep review.

## Recordkeeping

Every completed material upstream review must update:

- `docs/upstream/SYNC_LOG.md`;
- `docs/upstream/BASELINE.md` when the adopted baseline changes;
- `docs/upstream/REJECTED_CHANGES.md` for explicit rejections;
- `docs/upstream/PENDING.md` for deferred decisions.
