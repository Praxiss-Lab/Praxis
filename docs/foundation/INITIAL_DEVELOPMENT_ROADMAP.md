# Praxis Initial Development Roadmap

Status: DEVELOPMENT START ALLOWED — initial ordering subject to owner review

Foundation closed on 2026-10-06 for repository setup and local basic runtime
verification. See `FOUNDATION_GATE.md`. This ordering remains a revisable
proposal; closure does not approve every architecture or implementation choice.

This roadmap begins **after** `FOUNDATION_READY`.

It defines the initial order in which Praxis will evolve beyond the OpenHands
baseline. It does not pre-decide implementation details and it does not make
the historical AC backlog a Foundation prerequisite.

## Principle

Each roadmap phase starts with a targeted audit of the current Praxis codebase
and only the architectural findings / AC items relevant to that phase.

The rule is:

```text
roadmap area
→ inspect current code/upstream state
→ re-evaluate relevant AC items
→ requirements / decisions / ADR where needed
→ vertical implementation
→ verification
→ merge
```

Do not bulk revalidate every historical AC before programming.

## Phase 1 — Project / Workspace ownership

Objective:

Create a durable ownership model in which a Project/Workspace is the stable
owner of work context rather than treating an individual conversation as the
implicit lifecycle root.

Topics to resolve when this phase starts:

- Project/Workspace persistence;
- conversation membership;
- working directory ownership;
- cross-browser/server-side persistence;
- deletion and retention semantics;
- mapping between git worktrees and non-git workspaces.

Historical AC items relevant to this phase will be audited **at phase start**,
not during Foundation.

## Phase 2 — Conversation lifecycle

Objective:

Make conversation lifecycle explicit and subordinate to the owning
Project/Workspace where appropriate.

Topics:

- create / pause / resume / stop / delete;
- parent/subagent relationships;
- resource retention after conversation deletion;
- lifecycle recovery after backend restart;
- server-side ownership of conversation metadata.

## Phase 3 — Runtime and Docker resource ownership

Objective:

Remove ambiguity about which entity owns runtime/container resources.

Topics:

- Docker resources attached to Project/Workspace;
- conversation vs project stop semantics;
- cleanup/retention policy;
- Sysbox/DinD boundaries;
- resource discovery and reconciliation;
- safe restart and orphan handling.

## Phase 4 — Services and Preview ownership

Objective:

Make services and previews first-class resources owned by the durable project
context.

Topics:

- service registry;
- preview lifecycle;
- project deletion behavior;
- restart/reconcile behavior;
- Preview Gateway integration;
- stale/expired preview cleanup.

## Phase 5 — Agent Profile / Skills unification

Objective:

Reduce configuration fragmentation between agent profile, settings, skills,
runtime selection, and conversation launch state.

Topics:

- User/Public Skill assignment;
- profile-owned tool/skill configuration;
- server-side persistence;
- model/runtime binding;
- subagent inheritance rules;
- compatibility with existing `.openhands` state.

## Phase 6 — Automation management

Objective:

Turn automation into a first-class Praxis capability rather than an adjacent
feature.

Topics:

- durable automation ownership;
- Project/Workspace association;
- schedules and condition watches;
- execution history;
- retries and failure state;
- permissions/authority;
- automation-created conversations/tasks;
- observability.

## Phase 7 — Deterministic Runtime Enforcement

Objective:

Add enforceable policy gates for the OpenHands Plan method where deterministic
checks are appropriate.

Candidate enforcement:

- `BLOCKED_FOR_DECISION`;
- approved decision state;
- vertical-slice dependencies/status;
- verification obligations/evidence;
- required reviews;
- security mode;
- traceability where machine-checkable;
- Done transitions;
- Git commit evidence when configured.

The Method Layer remains the source of semantic engineering rules. Runtime
Enforcement implements only checks that can be made deterministic enough to be
safe.

## Cross-cutting rule: upstream integration

Before each phase, inspect relevant OpenHands upstream changes.

Classify them:

- ACCEPT;
- PARTIAL;
- ADAPT;
- SKIP;
- REJECT.

Never merge upstream wholesale merely because a roadmap phase touches the same
area.

## Roadmap change authority

This ordering is the initial Foundation roadmap, not an immutable product
contract.

Material reordering or replacement should be documented when actual code audit,
upstream evolution, or implementation evidence shows a better dependency
sequence.

## Foundation relationship

This roadmap satisfies the requirement to know **where development starts**.

It does not authorize programming until the Foundation Gate declares:

```text
FOUNDATION_READY
PROGRAMMING_START = ALLOWED
```
