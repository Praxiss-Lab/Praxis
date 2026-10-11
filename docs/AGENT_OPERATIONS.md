# Contributor agents, setup and automation boundaries

## Repository instructions

[AGENTS.md](../AGENTS.md) defines identity, ownership, safety, dependencies,
upstream integration, verification, completion and publication rules. Applicable
platform instructions and the user's authorized task take precedence. Nested
instructions specialize a subtree; a conflicting security/publication rule must
be resolved explicitly. Guides under `.agents/skills/` provide technical details
for their area. Supported agents load these differently; discovery and obeying
text do not enforce permissions or make a runtime capability exist.

The former mandatory `HUMAN:` PR section is removed. Agents still cannot invent
human approvals, statements or test results. The PR template describes actual
motivation, provenance, verification and risk; it is not an automatic validator.
Reviews/comments are posted only within an explicit external-action instruction.

## Development setup

From a clean checkout with Node.js 24+, npm and uv/uvx available:

```bash
npm run setup:dev
```

For frontend work with no local Python runtime requirement:

```bash
npm run setup:dev -- --frontend-only
```

`.openhands/setup.sh` is retained as the compatibility entry point and delegates
to `scripts/praxis/setup.sh`. The script checks prerequisites before npm, runs
`npm ci`, copies `.env.sample` only when `.env` is absent, adds an unset
`VITE_WORKING_DIR` and regenerates i18n. Existing env values are preserved, repeated
runs do not duplicate the workspace setting, and env symlinks are rejected.
An npm failure stops setup before env preparation. Later failures can leave
installed dependencies or prepared configuration; setup is not transactional.

Setup does not start servers, publish artifacts, create automation jobs, install
uv, or change consent. A missing uvx produces installation guidance; install it
explicitly using the official instructions linked in the error. `--frontend-only`
is a setup option, not a substitute for configuring a reachable backend at runtime.
`npm ci` executes the project's/dependencies' normal lifecycle scripts and installs
Husky through `prepare`; it is not an installation without code execution.

## Git hook behavior

The tracked `.husky/pre-commit` runs `npx --no-install lint-staged`. When the hook
is installed, the `package.json` staged-file configuration applies ESLint and
Prettier fixes to matching source files, checks TypeScript on matching staged
paths and verifies translations. Review staged changes after automatic fixes.
Missing local tooling fails rather than downloading a package in the hook.
Generated `.husky/_` launch files are installation output, not new tracked policy.
Hooks can be bypassed or absent: applicable CI remains necessary. There is no
configured stop hook, automatic review submission or deployment hook.

## Commands and prerequisites

| Command | Purpose / boundary |
| --- | --- |
| `setup:dev` | Development preparation as described above; native backend preparation requires uvx. |
| `dev` | Agent Server, Automation, frontend and ingress; requires native runtime tools. |
| `dev:minimal` | Minimal development launcher; consult runtime guide for supported options. |
| `dev:frontend` | Real frontend against a separately available backend; no simulated backend. |
| `dev:mock` | Frontend with mocked data; not real backend verification. |
| `typecheck` / `lint` / `test` | Type checking, source lint/format checks and unit tests. Tests/lint generate i18n as configured. |
| `build` / `build:lib` | Build the application / exportable library. Neither proves installed runtime behavior. |
| `test:e2e:mock-llm` | Scripted model suite with real stack plumbing; needs native runtime tools. |
| `test:e2e:mock-llm:docker` | Docker suite; requires daemon/image and explicit selection of the version being verified. |
| `test:e2e:live` | Real model test; requires an authorized credentialed run. No automatic live GitHub workflow exists. |
| `build:desktop` / `build:desktop:universal` | Package desktop artifacts, including runtime downloads; verify installation on target platforms separately. |

Use [workflow responsibilities](policies/WORKFLOWS.md), [development](DEVELOPMENT.md)
and the [runtime guide](../.agents/skills/local-stack-runtime/SKILL.md) for details.
Run relevant checks, not every expensive suite for a documentation edit. Record
real outcomes and unavailable tests. The agreed laptop/VM tests remain a separate
final step; this document does not claim they were executed.

## Skill sources and application automation

Repository contributor guides, user/project skills and public skill catalogs
have different loading mechanisms and provenance. The frontend incorporates
`@openhands/extensions` catalogs at build time; backend project/user skills are
retrieved through typed clients for the selected workspace/backend. Editing a
local contributor skill does not update the public catalog or register a job.

Before enabling an autonomous job, define its objective, permitted tools and
resources, trigger/timezone, backend, credential scope, runtime/cost limits,
stop/cancel conditions, retry policy and recovery. Check what the provider truly
enforces. A written limit is not a spending cap or sandbox boundary. Record missing
capabilities instead of claiming they were implemented. Do not modify existing
user jobs or create external integrations as an incidental development operation.

For webhooks, inspect actual source/events, destination, signature/auth validation,
duplicate handling, retries and redacted logs. For MCP, inspect tool access,
backend and credential scope; a skill does not grant permissions. Do not assume
account connections or GitHub webhooks exist from repository support code alone.
Each personal backend has independent state; do not imply synchronization of jobs,
keys or workspaces. This update enables no webhook, MCP connection or automation.

## Changes applied and verification

This configuration update rewrites AGENTS.md, aligns non-telemetry contributor
skills, introduces the canonical setup and compatibility wrapper, makes the Git
hook require local tooling, updates npm setup/install guidance and repository
links to `Praxiss-Lab/Praxis`, and preserves the existing GHCR namespace. The
runtime application/SDK contracts and public catalogs are unchanged.

Setup behavior is tested in isolated temporary checkouts with stub npm/uvx
commands: repeat execution/env preservation, missing uvx/frontend-only mode,
npm failure ordering and refusal of env symlinks. These are script behavior tests,
not a completed dependency installation or application deployment. Additional
verification covers existing release/publishing/version/upstream tests, script
syntax, command existence and guide links. Executed checks passed: 25 tests across seven suites (setup, package guidance,
workflow metadata, version synchronization and upstream/release inputs), ESLint
and formatting for changed tests, Bash syntax, guide links and documented npm
commands. The local lint-staged executable resolves successfully. No GitHub
Actions, release, desktop installer, application or VM run was started.

A subsequent configuration change removes the upstream analytics project key
and proxy fallback. The owner's EU project is now configured in `config/defaults.json`, shared by
native development and release builds. Workflows no longer consume PostHog
repository variables. Event/consent logic, backend launchers and logs remain
intact. See
[telemetry configuration and maintenance](TELEMETRY.md).
