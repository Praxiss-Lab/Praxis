# Praxis live ACP tests

These scripts exercise the frontend's ACP credential and conversation-building code against a real Agent Server and real model providers. Credentials are stored as backend secrets and referenced through `LookupSecret` when an agent starts.

The suite is separate from `npm test`: it needs Docker, available provider credentials and external model access. It can incur provider usage. Historical results are not evidence that a current Praxis checkout has passed; record the tested commit, server version and provider when running it.

## Start the pinned server

Run from the repository root. Select the Agent Server version configured for this checkout:

```sh
AGENT_SERVER_IMAGE="$(node -p "const c=require('./config/defaults.json'); c.images.agentServer + ':' + c.versions.agentServer + '-python'")"
docker run -d --name praxis-acp -p 127.0.0.1:8010:8000 \
  -v praxis-acp-data:/workspace \
  -v "$(pwd)/tools:/canvas-tools:ro" \
  -e OH_EXTRA_PYTHON_PATH=/canvas-tools "$AGENT_SERVER_IMAGE"
```

This starts Agent Server only, not Automation or the frontend. The read-only tools mount keeps the fixture's Python modules available when loading conversation state.

## Run scenarios

```sh
npx vite-node -c tests/e2e/live-acp/vite-node.config.mts \
  tests/e2e/live-acp/acp-docker-e2e.mts -- codex claude gemini
```

Pass a subset of provider names to narrow the run. Provider plans, default models and credential collectors live in `harness.mts`; change shared defaults there rather than in each scenario.

Credentials are read from host login state: Codex's `~/.codex/auth.json`, the Claude OAuth collector, and gcloud ADC for Gemini Vertex. The Claude keychain collector requires macOS. Providers without available credentials are skipped; a skip is not a passing provider test.

## Configuration

- `ACP_E2E_BASE_URL`: server origin; default `http://localhost:8010`.
- `ACP_E2E_CODEX_MODEL`, `ACP_E2E_CLAUDE_MODEL`, `ACP_E2E_GEMINI_MODEL`: model overrides.
- `ACP_E2E_GEMINI_SESSION_MODE`: session-mode override.
- `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`: Vertex configuration.

Use current ADC credentials for Vertex. Keep credentials out of published logs and captures. Record success/failure and skipped providers separately.

## Stop

```sh
docker rm -f praxis-acp
```

The `praxis-acp-data` volume remains and may hold credentials and conversations. Delete it separately only when the test data is no longer needed.
