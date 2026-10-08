# Praxis telemetry configuration and maintenance

## Current state

The upstream analytics project has been disconnected. Praxis supplies neither
its project key nor its reverse proxy. An owner project has not been created or
configured yet. No PostHog account or receiving server is needed to run Praxis.

This change replaces configuration ownership, not the telemetry feature:
event definitions, consent, identity, backend/Automation launchers and existing
opt-out flags are retained. No new runtime kill switch is introduced.
The frontend needs both an explicit project key and ingestion host before it can
initialize PostHog. Software logs are independent and continue normally.

## Files and responsibility

| File | Responsibility |
| --- | --- |
| `config/defaults.json` | Shared project key and ingestion host are empty. Do not insert another project's fallback credentials. |
| `src/services/telemetry.ts` | Reads owner configuration. No upstream proxy fallback; missing key/host gives no client. Event/consent behavior remains intact. |
| `.env.sample` | Shows the three frontend configuration variables as comments; no real project values are committed. |
| `docker/Dockerfile` | Accepts key, ingestion host and UI host as build arguments. The backend runtime receives key/host for the existing launcher mapping. |
| `.github/workflows/docker.yml` | Reads owner project settings from GitHub repository variables for release builds. |
| `.github/workflows/desktop-{linux,macos,windows}.yml` | Reads the same owner settings for desktop builds. |
| `scripts/dev-safe.mjs`, `scripts/dev-with-automation.mjs`, `docker/entrypoint.sh` | Existing mapping to Agent Server and Automation; unchanged in this task. |

## Values we will obtain from PostHog Cloud

We will create the owner's account/project together before supplying any values.
Choose the project region first, then copy the settings from that project.

| Value | Local source build (`.env`) | GitHub repository variable |
| --- | --- | --- |
| Project API key | `VITE_POSTHOG_API_KEY` | `PRAXIS_POSTHOG_API_KEY` |
| Ingestion host (events) | `VITE_POSTHOG_HOST` | `PRAXIS_POSTHOG_HOST` |
| UI host (dashboard region) | `VITE_POSTHOG_UI_HOST` | `PRAXIS_POSTHOG_UI_HOST` |

These GitHub variables are deliberately separate from the inherited
`POSTHOG_PROD_KEY` and `POSTHOG_STAGING_KEY`; workflows no longer read those.
Configure repository variables under the repository Actions settings. Do not
use a Personal API key: the browser needs the public Project API key. A project
key embedded in a frontend or image is visible to its consumers; it is not an
administrative credential.

The ingestion URL and dashboard URL have different purposes. Use the exact
region settings from your project; do not guess them or reuse upstream values.
PostHog Cloud hosts the receiving service; no PostHog server is installed on the
Praxis VM. Creating an account alone does not connect Praxis.

## Local and container configuration

For source builds, add the three values to the untracked local `.env`. Do not
commit that file. Rebuild the frontend after changing these build-time values.
No local `.env` or deployed Compose file has been edited by this task.

The existing launchers derive backend/Automation settings from explicit service
variables first, then the frontend variables. Service-specific configuration is
available through `OH_TELEMETRY_POSTHOG_API_KEY`,
`OH_TELEMETRY_POSTHOG_HOST`, `OH_TELEMETRY_EXPORTER=posthog`, and
`AUTOMATION_POSTHOG_API_KEY`/`AUTOMATION_POSTHOG_HOST`.
Use the same owner project and ingestion region for all components initially.

For Docker, the workflow passes all three frontend build arguments. The complete
image forwards its configured key/host to the existing backend and Automation
startup mapping. Runtime environment overrides can change backend settings, but
cannot rewrite the already compiled frontend. Library consumers retain
`configureTelemetry({ apiKey, apiHost, uiHost })` for runtime configuration.

## Maintenance

1. Change project key/region in the local configuration and GitHub variables,
   as applicable; keep the three values consistent.
2. Rebuild and distribute frontend, Docker image and desktop artifacts when
   browser build-time configuration changes. Existing published artifacts do
   not change retroactively.
3. Restart Agent Server and Automation after changing their runtime variables.
4. Confirm new test events in the owner's project, and verify the browser's
   request destination. Complete this live check after the project is created.
5. Manage dashboards, retention and access in PostHog Cloud. Adding events still
   requires a code change and review of the payload.
6. When reviewing upstream updates, reject reintroduced project keys/proxies.
   Preserve useful event/consent fixes without restoring upstream destinations.

Existing opt-out interfaces remain supported; changing consent or toggling a
flag cannot supply a missing project destination. The retained installation
count is anonymous and pre-consent when analytics is explicitly configured;
review that behavior before connecting the new project. Ordinary requests and
client/version compatibility headers remain; telemetry is not an offline mode.

## Verification boundary

This is a repository configuration change. No PostHog account, project, server,
release, deployment or live data collection has been activated. Previously
published images and installed desktop apps retain their previous configuration
until replaced with new artifacts.

Local verification: 200 tests across nine suites and `npm run typecheck` passed.
Coverage includes missing destinations, existing configured event/consent
behavior, native mappings and owner variable wiring in all four build workflows.
Scoped frontend/configuration test lint, workflow YAML and documentation links
passed. Container builds and live PostHog delivery are deferred.
