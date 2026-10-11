# Praxis ACP backend example

Run Codex, Claude Code or Gemini CLI through a containerized Agent Server and connect the Praxis frontend to it. This example starts Agent Server only; it does not start the complete Praxis backend with Automation.

## Start the pinned backend

From the repository root, generate the image configuration using `config/defaults.json`:

```sh
npm run example:acp-docker:env
cd examples/acp-docker
docker compose up
```

The server listens at `http://localhost:8010` and stores state in the `acp-data` volume. Rerun the generation command after updating runtime versions. A manually maintained `.env` override can otherwise keep an obsolete image. The Compose fallback without this generated file uses a moving image tag.

## Connect the frontend

In a second shell, from the repository root:

```sh
VITE_BACKEND_BASE_URL=http://localhost:8010 npm run dev:frontend
```

Alternatively, add `http://localhost:8010` as an Agent Server backend in the backend selector. The example permits localhost browser origins. See [ACP agents](../../docs/ACP_AGENTS.md#running-acp-agents-in-a-docker-container) for the complete walkthrough.

## Supply credentials

Choose the ACP provider in onboarding and complete its credential step. A fresh container does not have your host CLI login.

| Provider            | Subscription or account credentials                                                                                      | API-key alternative |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| Codex               | `CODEX_AUTH_JSON`, contents of `~/.codex/auth.json`                                                                      | `OPENAI_API_KEY`    |
| Claude Code         | `CLAUDE_CODE_OAUTH_TOKEN`                                                                                                | `ANTHROPIC_API_KEY` |
| Gemini CLI / Vertex | `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_GENAI_USE_VERTEXAI=true` | `GEMINI_API_KEY`    |

The frontend saves values to the backend secret store. Start requests reference them as `LookupSecret` values, resolved when the agent starts. JSON credentials are materialized for the CLI on the backend.

Claude OAuth must not be combined with a saved `ANTHROPIC_BASE_URL`. Gemini ADC must be current; an expired login can produce `invalid_rapt`. Credentials supplied only through container environment variables may not satisfy the UI login probe: complete the UI credential step when prompted.

## Stop and preserve state

```sh
docker compose down
```

This retains the volume. `docker compose down -v` also deletes stored credentials, conversations and other volume data.
