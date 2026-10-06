# Praxis Fork Foundation

Status: IN PROGRESS

Praxis is being established as an independently maintained MIT-licensed fork
of OpenHands. The purpose of the Foundation Phase is to make the fork stable,
auditable, testable, deployable, and safe to evolve before structural product
development begins.

## Foundation objectives

The Foundation Phase establishes:

- an exact upstream baseline;
- a controlled upstream-integration workflow;
- independent Praxis versioning and release policy;
- CI and compatibility gates;
- container build and publication owned by Praxis;
- a reproducible deployment path;
- rollback expectations;
- licensing and attribution;
- engineering and contribution policy;
- documentation for maintenance continuity.

## Boundary

This phase does **not** redesign Workspace/Project ownership, conversation
lifecycle, Docker ownership, skills, profiles, automation semantics, or runtime
enforcement. Those belong to later product-development phases.

Existing architectural findings may be retained as backlog context, but they
are not Foundation Gate prerequisites.

## Foundation Gate

Structural product development begins only after the repository can truthfully
declare `FOUNDATION_READY`.

The gate will require, at minimum:

- fork relationship and baseline recorded;
- upstream integration policy accepted;
- baseline build/test path established;
- Praxis CI established;
- Praxis container publication path established;
- deployment and rollback path verified;
- licensing/attribution complete;
- engineering policy accepted;
- initial development roadmap accepted.

This document will be updated as the Foundation Phase progresses.
