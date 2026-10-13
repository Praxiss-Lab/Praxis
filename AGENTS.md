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
not the definition of Praxis personal clouds. Rename technical package names,
paths and environment variables only as described in "Incremental rebranding".

## Incremental rebranding

Praxis derives from OpenHands Agent Canvas. The goal is a codebase with no names
referring to upstream projects (OpenHands, All Hands, Agent Canvas) except where
listed below. Do it incrementally: while working on a task, rebrand what you touch
instead of scheduling one large rename.

- **Rename freely, in files the task touches:** comments, docstrings, log and error
  messages, UI copy and translations (all locales, then `npm run make-i18n`),
  documentation links, test names, and internal names that are never persisted,
  exported or read from outside the module (local variables, private helpers,
  CSS classes, test IDs after updating their tests).
- **Rename only with compatibility:** npm/package names, executables
  (`agent-canvas`), environment variables (`OH_*`, `AGENT_CANVAS_*`), state and data
  paths (`~/.openhands`, `/home/openhands`), Docker image names, localStorage and
  settings keys, API fields, persisted identifiers and backend contracts. Add the
  Praxis name, keep reading the old one (env/path/key fallback or alias, one
  obvious owner), migrate stored data where needed, cover both names with tests,
  and document the alias. Remove an old name only in a later, explicitly
  authorized change once no supported data or deployment depends on it.
- **Never rename:** `LICENSE`, `NOTICE` and attribution text; provenance facts
  (upstream review records, `SYNC_LOG.md`, release notes of past versions,
  migration fixtures and archive tags); blocklists that reject upstream hosted
  domains (`cloud-endpoint-policy.ts`, `repository-check.sh` guards); tests and
  fixtures that prove legacy names still load; names of genuine third-party
  products or skills.
- **Scope:** keep rebranding inside the files and boundary of the current task.
  Put it in its own commit (`rebrand: ...`) separate from behavior changes, run
  the normal checks (never `[skip ci]` for code), and list renamed names and new
  aliases in the PR. Cross-boundary renames shared with the SDK or Automation
  follow the owning repository's rules first.
- **Known content still to rebrand:** `vendor/praxis-extensions-0.29.0.tgz` skills and
  the `vendor/automation` snapshot reference OpenHands repositories; change them
  only through an authorized extensions or Automation task, not incidentally.

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

## Branches and merge authorization

`main` is the stable integration branch. Do not edit, commit or push changes
directly to `main`. Start each development, fix or configuration task on a
dedicated branch from the current remote `main`, using a descriptive name such as
`feature/*`, `fix/*` or `chore/*`. Documentation tasks start from the
`documentation` branch instead and open their PR into `documentation` (see
"Documentation, workflows and CI" below).

Commit and verify the changes on that branch, then present the diff and check
results for review through a pull request. Implementing or publishing a branch
does not authorize merging it. Merge into `main` only after explicit maintainer
authorization for that change; never merge automatically or enable auto-merge.
Passing CI alone is not approval. Apply this rule to agents and dependency or
upstream update pull requests as well.

Create working branches when needed. After an authorized merge, a completed
branch may be deleted once its useful changes are preserved in `main` and no
remaining work depends on it; obtain authorization for the deletion.

The current release Action publishes from `main` after explicit release
authorization. It does not need a permanent `release/*` branch and does not
create, update or merge one. Prepare any source or version changes on a working
branch and integrate them with approval before starting the release Action.

## Dependencies, versions and upstream

Use Node.js 24+ and `npm ci`. Direct npm dependencies remain exact-pinned; update
`package.json` and `package-lock.json` together through npm. Explain the need for
new dependencies and review compatibility, license and runtime/bundle impact.
Dependabot monitors the configured npm and Actions ecosystems, not arbitrary
Python pins in `config/defaults.json`; inspect its groups when adding a dependency.
Keep runtime versions centralized and verify SDK/server/Automation compatibility.

Use [the upstream procedure](https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/upstream/README.md): fetch, freeze a target,
prepare an integration branch, record ACCEPT/PARTIAL/REJECT/DEFER decisions, run
applicable checks, and obtain the maintainer's integration decision. No automatic
merge into `main`; update the review checkpoint only after completing the interval.

`PRAXIS_VERSION` is the product version. Keep its package/lock/config surfaces
aligned; Agent Server and Automation versions are independent. Follow
[release policy](https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/policies/RELEASE.md) and the release skill. Ordinary pushes
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
Use [workflow responsibilities](https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/policies/WORKFLOWS.md) and the E2E skill to
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

Use [the brand guide](https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/BRAND.md) for approved logos and palette. Do not redesign
branding as an incidental code change. Analytics destinations belong to the Praxis owner; do not restore upstream
project keys or proxy fallbacks. Read [telemetry configuration](https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/TELEMETRY.md).
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
[agent operation](https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/AGENT_OPERATIONS.md); runtime automation/telemetry changes
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

## Documentation, workflows and CI

### Documentation

Documentation lives only as Markdown on the
[`documentation`](https://github.com/Praxiss-Lab/praxis/tree/documentation) branch,
which has history independent of `main`; its README is the index. There is no
generated site and no GitHub Pages. Do not add `docs/` to `main`; link to
`https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/<page>.md` instead.

- **When to update it:** in the same task as any change to user-visible behavior,
  installation, configuration, launch modes, workflows, release or versioning
  policy, or the upstream procedure. Open the documentation PR alongside the code
  PR and link them; a task is not complete while its owning page is stale.
- **How:** branch from `documentation`, open the PR into `documentation`. Use
  relative links between pages and absolute
  `https://github.com/Praxiss-Lab/praxis/blob/main/...` links for code, because code
  files do not exist on `documentation`. The branch has no workflows, so
  documentation PRs never run Actions.
- **Upstream reviews:** `LAST_REVIEWED`, `SYNC_LOG.md` and review files are under
  `docs/upstream/` on `documentation`. `scripts/praxis/prepare-upstream-integration.sh`
  reads the checkpoint there, creates `integration/upstream-<label>` from `main` and
  commits the snapshot to `upstream-review/<label>`; merge that into `documentation`.

### Workflows on `main`

| Workflow | Trigger | Role |
| --- | --- | --- |
| `praxis-ci.yml` (Praxis CI) | PRs to `main`, manual | Core static checks, tests and builds |
| `praxis-smoke.yml` (Praxis Smoke) | PRs to `main`, manual | Frontend runtime smoke |
| `docker-check.yml` (Docker Check) | PRs touching runtime/config paths, manual | Local image build and complete/backend/frontend mode verification; no publication |
| `sdk-version-sync.yml` | PRs touching SDK pin surfaces, manual | SDK revision consistency |
| `desktop-linux.yml`, `desktop-macos.yml`, `desktop-windows.yml` | PRs touching desktop paths, manual, release | Desktop package builds |
| `praxis-migration.yml` | PRs touching migration files, manual | Migration safeguards and confirmed restoration of original 1.25.0 assets |
| `praxis-release.yml` (Praxis Release) | Manual, from `main` only | Explicitly authorized publication; calls `docker.yml` |
| `docker.yml` | Called by Praxis Release | Multi-architecture GHCR image publication |
| `mock-llm-e2e.yml`, `mock-llm-docker-e2e.yml` | `main` pushes / manual | Full scripted-model E2E; currently disabled manually |
| `ci.yml` (Upstream Compatibility CI) | Manual | Optional overlap run on an integration branch |
| `issue-readiness-check.yml` | `ready-for-dev` label | Permission check for issue readiness |

Validation runs on PRs, not again on the merge push. Praxis CI, Smoke and the
E2E push ignore `docs/**`, `**/*.md`, `.pr/**`, `LICENSE` and `NOTICE`, so
Markdown-only PRs (including `AGENTS.md` and `.agents/` guides) start no
validation by themselves. Details:
[WORKFLOWS.md](https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/policies/WORKFLOWS.md).
Change a workflow only on a working branch with the PR showing its run; do not
weaken a check to make a PR pass.

### When to use `[skip ci]`

Add `[skip ci]` to the commit message only when the change cannot affect behavior,
builds or tests: Markdown, guidance text or comments, when a path filter would
still start validation. Never use it for source, tests, dependencies, lockfiles,
`config/`, scripts, Docker, Electron or workflow files, and never to bypass a
failing check. It skips `push` and `pull_request` runs for that head commit;
`issues`/`pull_request_target` workflows still run. `main` currently has no
required status checks, so a skipped run does not block merging; review is
still required.

A `[skip ci]` commit on the PR branch does not reach `main` with a regular merge:
the merge commit has its own message, so validation runs again after the merge.
For a documentation- or guidance-only PR into `main`:

1. Put `[skip ci]` at the end of the **PR title** as well as the commit message.
2. Merge with **Squash and merge** (arrow ▾ next to the merge button), keep
   `[skip ci]` in the squash commit title, then confirm.
3. If the agent is authorized to merge, it does this itself
   (`gh pr merge <n> --squash --subject "<title> [skip ci]"`). Otherwise, when
   handing the PR over, the agent must remind the maintainer of steps 2–3 in its
   final message.

Use a regular merge, and let CI run, for any PR that changes code.

### Updating the Praxis SDK

Praxis consumes `Praxiss-Lab/praxis-sdk` at the exact revision in
`config/defaults.json` (`sdk`), for the Agent Server and bundled Automation alike.
After an SDK change is merged in its repository, update that revision on a
working branch, run `node scripts/check-sdk-version-sync.mjs` and the checks for
the affected boundary, and let SDK Version Sync and Docker Check run on the PR.
For local SDK work set `OH_AGENT_SERVER_LOCAL_PATH` to the SDK checkout. See
[SDK independence](https://github.com/Praxiss-Lab/praxis/blob/documentation/docs/SDK_INDEPENDENCE.md).

### Repository settings and credentials

| Requirement | Used by | Status |
| --- | --- | --- |
| `GITHUB_TOKEN` with `packages: write` | `docker.yml`, Praxis Release | Provided by GitHub |
| Secret `PRAXIS_SDK_READ_TOKEN` (optional, read access to `Praxiss-Lab/praxis-sdk`) | `docker-check.yml`, `docker.yml` | Falls back to `github.token` while the SDK is public |
| Workflows *Mock-LLM E2E Tests* and *Mock-LLM Docker E2E Tests* | Full E2E after `main` pushes / manual image E2E | Disabled manually; re-enable under Actions when needed |
