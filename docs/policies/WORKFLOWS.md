# Praxis workflow responsibilities

| File | Role and trigger |
| --- | --- |
| `praxis-ci.yml` | Core static checks, tests and builds on eligible PRs to `main`, pushes to `main`, or manual dispatch. |
| `praxis-smoke.yml` | Frontend runtime smoke checks on eligible PRs/pushes or manual dispatch. |
| `docker-check.yml` | Local Docker build and mode verification on matching runtime/configuration paths or manual dispatch; no registry publication. |
| `sdk-version-sync.yml` | Dependency-version consistency on matching paths or manual dispatch with an optional expected SDK version. |
| `mock-llm-e2e.yml` | Full scripted-model E2E suite after eligible pushes to `main` or manual dispatch. |
| `mock-llm-docker-e2e.yml` | Manual E2E against an explicitly selected published image. |
| `ci.yml` | Manual Upstream Compatibility CI; use the selected integration branch when needed. Overlaps core checks intentionally as an optional run. |
| `praxis-release.yml` | Explicitly authorized manual publication from `main`; verifies before publishing image and GitHub artifacts. |
| `praxis-migration.yml` | PR safeguard tests and explicitly confirmed restoration of original 1.25.0 assets into the replacement repository; no image build or publication. |
| `docker.yml` | Reusable image publication called directly by Praxis Release; native amd64/arm64 builds and digest merge. |
| `desktop-linux.yml` | Paths-filtered PR build, manual build, or externally triggered release build. |
| `desktop-windows.yml` | Paths-filtered PR build, manual build, or externally triggered release build. |
| `desktop-macos.yml` | Native PR builds, manual builds including universal DMG, or externally triggered universal release build. |
| `issue-readiness-check.yml` | Permission check when `ready-for-dev` is applied to an open issue. |

[Dependabot](../../.github/dependabot.yml) remains configured for weekly npm and
GitHub Actions dependency updates. Its PRs follow the same applicable checks.
The chart is experimental and defaults to the Praxis registry; selecting an image
does not prove Kubernetes runtime compatibility. Desktop builds retain the
inherited technical app name and packaging paths until a separately reviewed
branding migration.

Removed automation includes disabled upstream publishing, release-please, external
issue bots, cross-repository chart updates, PR-description gates and PR-artifact
cleanup. Checker scripts with no remaining callers and their dedicated test
workflow were also removed. Historical upstream PR screenshots were not used by
current documentation or tests and remain recoverable from Git history.

Upstream imports are prepared manually on a separate branch, with explicit
selection and no automatic merge. See [the upstream procedure](../upstream/README.md).
[Release policy](RELEASE.md) explains image/native publication and the separate
manual desktop process. [Issue triage](ISSUES.md) explains the retained label check.

This inventory concerns repository configuration. It does not claim that desktop
installers, Kubernetes deployment, laptop or VM runtime tests have been performed.
The contributor policy and setup are documented in
[agent operation](../AGENT_OPERATIONS.md) and root `AGENTS.md`. Telemetry evaluation
is separate and pending.
