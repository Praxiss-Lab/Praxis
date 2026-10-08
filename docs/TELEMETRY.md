# Praxis telemetry configuration and maintenance

## One shared configuration

The owner has selected one PostHog Cloud project in the EU region as the Praxis
analytics default. Its public project token and hosts are stored in
`config/defaults.json` under `telemetry`:

| Field | Purpose |
| --- | --- |
| `posthogApiKey` | Public Project token identifying the owner's project. |
| `posthogHost` | Event ingestion: `https://eu.i.posthog.com`. |
| `posthogUiHost` | Dashboard region: `https://eu.posthog.com`. |

Native development and distributed builds use these values automatically. No
`.env` or GitHub repository variable is needed for the default project. The
Project token is public and included in shipped artifacts. Personal API keys
and project secret API keys must never be placed in this configuration.

## How each component reads the JSON

| Component | Configuration path |
| --- | --- |
| Frontend | `src/services/telemetry.ts` imports JSON defaults for SDK initialization. |
| Native Agent Server | `scripts/dev-safe.mjs` maps the JSON to `OH_TELEMETRY_*`. |
| Native Automation | `scripts/dev-with-automation.mjs` maps the JSON to `AUTOMATION_POSTHOG_*`; static and desktop launchers reuse it. |
| Docker backends | The Dockerfile generates `defaults.env` from JSON; `docker/entrypoint.sh` maps those values to the backend services. |
| Docker/desktop releases | Workflows build the repository with the same JSON. They neither read PostHog repository variables nor rewrite the JSON. |

The `PRAXIS_POSTHOG_API_KEY`, `PRAXIS_POSTHOG_HOST` and
`PRAXIS_POSTHOG_UI_HOST` GitHub variables are no longer consumed. Their existing
values can be removed from Repository variables and Environments; removing them
has no effect on this configuration. The agent has not deleted GitHub settings.

Existing explicit environment, custom Docker build arguments and library
`configureTelemetry({ apiKey, apiHost, uiHost })` overrides remain supported for
consumers who deliberately choose another project. They are optional and take
precedence over the shared JSON; clear old overrides to use the Praxis default.
The normal release workflows do not supply these overrides.

## Maintenance

1. To change the default project, edit `telemetry.posthogApiKey` in the JSON.
2. If changing region or destination, update both host fields in the same change.
3. Restart native development services so they reload the JSON. Rebuild static
   frontend/library outputs, Docker images and desktop installers before using
   the new browser settings. A deployed bundle does not reread repository files.
4. Publish updated artifacts when authorized; old installed releases keep their
   previous settings until replaced. Do not update GitHub variables for telemetry.
5. Check the owner's PostHog project for the expected events after deployment.
   Manage dashboards, access and retention inside PostHog Cloud.
6. Review upstream changes for reintroduced project keys or proxies. Preserve
   useful event and consent changes without restoring upstream destinations.

PostHog Cloud provides the receiving service; no PostHog server is needed on the
Praxis VM. Telemetry configuration identifies the project but does not replace
consent rules. Existing events, identity behavior, opt-out controls and software
logs are unchanged. The retained anonymous install count is pre-consent when
analytics is configured; session/custom events follow the existing consent flow.

Software logs remain local diagnostic output through existing logging settings.
They are separate from product analytics. Ordinary API calls and client/version
compatibility headers remain independent of PostHog.

## Verification boundary

The configuration is shared across source development and release builds. Mock
SDK and launcher tests verify settings and existing event/consent behavior;
the Docker entrypoint mapping is tested through Bash without building an image.
Live event reception in PostHog and full laptop/VM execution are separate checks.
No release or deployed artifact is updated merely by changing this source file.

Local verification for this configuration: 219 tests across 12 suites passed,
including SDK initialization from JSON, native/static mappings, Docker Bash
mapping and workflow defaults. TypeScript, scoped lint, workflow YAML, doc links
and the production frontend build passed. All three JSON settings are present
in the compiled frontend. No Actions, release or full container build was run.

A single direct API connection probe (`praxis_configuration_test`) using these
JSON values timed out from this environment. Event reception is not confirmed;
this probe is separate from the mocked SDK and launcher checks above.
