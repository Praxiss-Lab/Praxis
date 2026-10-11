# Working on Praxis

## Scope and instruction precedence

This repository is `Praxiss-Lab/Praxis`: the React/TypeScript interface, backend
integration, native launchers, Docker distribution and Electron desktop packaging.
Follow applicable platform/system instructions and the user's task first. This
file defines repository-wide rules; nested `AGENTS.md` files may specialize their
subtree without silently overriding repository-wide security or release rules.
Load the relevant skills below before editing their area. If guides conflict with
the actual code or an authorized task, identify and resolve the discrepancy; do
not invent functionality or treat old upstream instructions as current policy.
Instructions guide supported agents; they do not enforce runtime permissions,
branch protection, budgets or approvals by themselves.

## Ownership and supported architecture

Praxis owns product behavior, UI state, backend selection, integration and local
stack orchestration. The independently versioned Agent Server/SDK, typed client,
Automation and public extensions supply their own contracts. Trace defects to the
owning component; do not duplicate server APIs or wire schemas in the frontend.
Plan provider changes separately when the published contract needs to change.

Preserve native and Docker execution and complete/backend/frontend modes. The
backend includes Agent Server and Automation. Frontend and backend may run on
separate devices. Each personal VM is an independent backend with its own state,
workspaces and credentials. Do not promise central cloud services, replication
or synchronization. Legacy `kind: cloud` transport remains code compatibility,
not the definition of Praxis personal clouds. Keep technical package names,
paths and environment variables until an explicit migration changes them.

## Work method and safety

- Inspect the current tree, relevant consumers and existing tests before editing.
  Preserve unrelated user changes; keep modifications within the requested scope.
- Reuse existing modules and give durable state one owner and one obvious writer.
  Cover hydration, migrations and create/update/delete/default/selection transitions.
- Reuse `DEFAULT_WORKING_DIR` from `src/api/agent-server-config.ts`.
- Do not print or commit credentials, state databases or credential-bearing logs.
  Do not send secrets to unrelated hosts or widen network exposure implicitly.
- Destructive data operations and migrations need a concrete impact/recovery plan
  and authorization for the affected data. Routine reversible development work
  proceeds within the user's instruction; do not repeatedly ask for authorization.
- Publish releases, deploy, enable external integrations, send comments/reviews,
  or activate automations only when the task authorizes that operation. Existing
  authorization persists within its scope. Never fabricate human approval.
- Do not bypass failed checks, remove guards, or fabricate evidence to claim success.

## Dependencies, versions and upstream

Use Node.js 24+ and `npm ci`. Direct npm dependencies remain exact-pinned; update
`package.json` and `package-lock.json` together through npm. Explain the need for
new dependencies and review compatibility, license and runtime/bundle impact.
Dependabot monitors the configured npm and Actions ecosystems, not arbitrary
Python pins in `config/defaults.json`; inspect its groups when adding a dependency.
Keep runtime versions centralized and verify SDK/server/Automation compatibility.

Use [the upstream procedure](docs/upstream/README.md): fetch, freeze a target,
prepare an integration branch, record ACCEPT/PARTIAL/REJECT/DEFER decisions, run
applicable checks, and obtain the maintainer's integration decision. No automatic
merge into `main`; update the review checkpoint only after completing the interval.

`PRAXIS_VERSION` is the product version. Keep its package/lock/config surfaces
aligned; Agent Server and Automation versions are independent. Follow
[release policy](docs/policies/RELEASE.md) and the release skill. Ordinary pushes
and upstream updates do not authorize publication. The GHCR image is published under the organization at
`ghcr.io/praxiss-lab/praxis`.

## Verification and completion

Behavioral changes need focused tests through real code paths; use TDD for fixes
and new logic. Extend suitable tests, mock underlying services rather than the
hook being tested, and avoid duplicate assertions or implementation-copy tests.
Preserve coverage for routing, accessibility, asynchronous transitions and contracts.
Docs-only changes need link/consistency checks, not live credentials or new tests.

Core checks are `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`
and `npm run build:lib`; run the applicable checks for the affected boundary.
Use [workflow responsibilities](docs/policies/WORKFLOWS.md) and the E2E skill to
select additional checks. Live LLM tests require an authorized real-model run;
mock suites, builds and registry inspection are different evidence.
For UI changes capture the actual app; temporal behavior needs a recording.
For setup/hooks use actual terminal behavior; installed artifacts must be tested
outside the source checkout. Record blocked or deferred laptop/VM checks honestly.

A task is complete when the requested result is implemented, applicable checks
have outcomes, owning documentation is updated, and remaining risks/limitations
are explicit. Report the actual tested commit/environment and distinguish verified,
mocked, inferred and untested behavior. Do not claim production readiness from
instructions or static checks alone. Keep technical PR summaries concise and use
[the PR template](.github/pull_request_template.md). `HUMAN:` is not a required
section; never edit human-authored approvals or manufacture statements for them.

## UI, translations and specifications

Use [the brand guide](docs/BRAND.md) for approved logos and palette. Do not redesign
branding as an incidental code change. Analytics destinations belong to the Praxis owner; do not restore upstream
project keys or proxy fallbacks. Read [telemetry configuration](docs/TELEMETRY.md).
The owner project token and EU hosts live in `config/defaults.json`; do not
replace these with required .env or GitHub variables. The public Project token
is approved for this shared config; never commit personal/secret API keys.
Preserve existing events, consent and log behavior.

After editing `src/i18n/translation.json`, run `npm run make-i18n` and
`npm run check-translation-completeness`. Remove deleted keys from relevant test
mocks as well; generated `src/i18n/declaration.ts` remains untracked.
Keep specification IDs stable and deprecate rather than renumber them. Preserve
existing `@spec` links and attach applicable IDs to behavior and tests.
For multiline commit or PR text use a file/structured argument rather than shell
interpolation. PR-only `.pr/` artifacts require manual removal before merge.

## Autonomous application work

For an automation, establish its goal, allowed tools/resources, backend,
credentials, trigger, runtime/cost limits, stop conditions and failure recovery.
Do not activate a new job or integration implicitly or alter existing user jobs
without scope. Instructions are not budget enforcement: inspect provider/runtime
capabilities and mark absent limits as unimplemented. User/project skills and
published catalogs have different provenance and update paths. See
[agent operation](docs/AGENT_OPERATIONS.md); runtime automation/telemetry changes
are separate from this repository-instruction update.

## Specialized guides

Read each applicable entry and its linked references; keep detailed invariants in
the owning guide and update that guide when code changes its invariant.

| Guide | Scope |
| --- | --- |
| [Code review](.agents/skills/custom-codereview-guide.md) | Ownership, compatibility, evidence and review decisions. |
| [Frontend](.agents/skills/frontend-development/SKILL.md) | React, state, i18n, mocks, performance and UI conventions. |
| [API contracts](.agents/skills/frontend-api-contracts/SKILL.md) | Typed clients, auth, compatibility and backend contracts. |
| [Runtime](.agents/skills/local-stack-runtime/SKILL.md) | Setup, services, modes, ingress, Docker and lifecycle. |
| [Desktop](.agents/skills/desktop-electron/SKILL.md) | Electron, bundled runtimes and installed packaging. |
| [E2E](.agents/skills/e2e-testing/SKILL.md) | Mock, Docker and live verification boundaries. |
| [Release](.agents/skills/release.md) | Explicit Praxis publication and recovery. |
| [PR design](.agents/skills/pr-design-doc/SKILL.md) | Proportionate, temporary design context. |
| [Telemetry](.agents/skills/telemetry-analytics/SKILL.md) | Owner project configuration, existing tracking/consent contracts. |
