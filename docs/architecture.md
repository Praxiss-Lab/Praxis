# Praxis architecture

Praxis separates the interactive frontend from the services that execute agents. The frontend can connect to a backend on the same computer or to independent backends on your VMs. A VM running that backend is your personal cloud.

![Praxis architecture](assets/praxis-architecture.svg)

## Components and ownership

| Component          | Responsibility                                                                                | Location                                                     |
| ------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Frontend           | Conversations, files, terminals, browser views, settings, backend selection and automation UI | Local process, frontend container or complete stack          |
| Agent Server       | Agent execution, conversation APIs/events, workspaces, settings and secrets                   | Selected backend                                             |
| Automation         | Scheduling, triggers and agent-run dispatch                                                   | Backend                                                      |
| Ingress            | Routes frontend/API/WebSocket and automation traffic                                          | Complete or backend stack; frontend mode can proxy a backend |
| Persistent storage | Backend conversations, settings, secrets and workspace files                                  | Backend host directories or volumes                          |

The UI consumes typed server contracts. Execution and scheduling belong to their backend services. Runtime service URLs are advertised through `/server_info.runtime_services`; the frontend includes relevant backend-provided context in new conversations.

## Personal clouds

Each backend has its own endpoint, key and storage. The backend selector allows the frontend to switch between Agent Server installations. Backend selection does not create replication, shared storage or a cluster. Automation runs where that backend is installed, so it can continue running while a browser is closed, provided the backend remains running.

Direct connections require backend reachability and allowed origins from the browser. A configured frontend proxy requires reachability from the frontend server/container. Remote access uses explicit API-key authentication and the HTTPS or private-network setup described in [self-hosting](SELF_HOSTING.md).

## Launch modes

| Mode     | Services                                       |
| -------- | ---------------------------------------------- |
| Complete | Frontend, Agent Server, Automation and ingress |
| Backend  | Agent Server, Automation and API ingress       |
| Frontend | Frontend server and optional backend proxy     |

Native processes and Docker expose these same modes. Docker publishes one image with selectable services. The [distribution guide](distribution/README.md) contains commands for all three modes and separate machines.

Development also provides a minimal stack without Automation, a static frontend stack and an MSW mock frontend. `npm run build` builds the standalone application; `npm run build:lib` builds embedding entrypoints.

## Source layout

- `src/api/`: typed service adapters, connection options and backend registry.
- `src/components/`, `src/hooks/`, `src/stores/`: UI, query/mutation hooks and frontend state.
- `src/i18n/`, `src/themes/`: localization and appearance.
- `src/mocks/`, `__tests__/`, `tests/`: mocks and verification suites.
- `bin/`, `scripts/`, `docker/`: native launchers, stack orchestration and container distribution.
- `config/defaults.json`: runtime dependency versions and compatibility floor.

Compatibility adapters remain in the source tree. Their API contract names do not define whether an Agent Server is physically local or hosted on your VM; see [API services](../src/api/README.md).

## Distribution and verification

GitHub releases contain the native installation archive and Docker image reference. The native executable is `agent-canvas`. The Docker image supports `linux/amd64` and `linux/arm64` and starts the selected mode.

CI runs type checking separately from linting, unit/component tests, standalone and library builds, and package checks. Release verification also checks the container modes and their integration. These checks validate artifacts; deployment to a computer or VM remains a separate operation.
