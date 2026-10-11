# Praxis issue triage

Use the bug and feature forms in `.github/ISSUE_TEMPLATE/`. Bug reports should
identify the exact version or commit, installation method, launch mode, backend
location, reproduction steps, expected behavior and observed failure. Screenshots,
video and redacted logs can support a report; do not include credentials.
Feature requests should describe the desired outcome and observable acceptance
criteria. No implementation evidence is required for a feature that does not yet
exist.

`ready-for-dev` means repository maintainers consider the issue clear enough to
start. It does not mean the implementation passed tests. The retained
`issue-readiness-check.yml` checks who applied that label and removes it when the
actor lacks write, maintain or admin permission. It does not assess issue content,
run an AI triage service, or implement a release gate. Maintainers review content
manually. If a collaborator permission lookup fails, the workflow currently treats
the actor as unauthorized and removes the label; inspect the run before reapplying.

Duplicate detection, external issue-triage bots, PR-description validation and
automatic PR-artifact cleanup are not configured. Their unused workflows and
checker scripts have been removed. Contribution and review rules are maintained
separately in `AGENTS.md` and the repository's review guide.
