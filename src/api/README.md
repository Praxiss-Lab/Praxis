# Praxis frontend API services

This directory connects the frontend to the selected backend. Services own transport and app-specific adaptation; query and mutation hooks own fetching, caching and loading/error state for React consumers.

## Agent Server access

Use typed clients from `@openhands/typescript-client`. Obtain the selected host, session key and workspace defaults through `getAgentServerClientOptions` or `getAgentServerHttpClientOptions` in `agent-server-client-options.ts`. Do not replace those helpers with hardcoded localhost addresses or a separate credential store.

For a conversation with its own runtime URL/key, pass those conversation overrides through the shared options helper. Runtime requests go directly to that runtime via the typed client. When an endpoint is missing, extend the owning client contract before consuming it here.

Existing implementations such as `conversation-service/conversation-service.api.ts` demonstrate typed event access and conversation-specific overrides. `no-direct-agent-server-calls.test.ts` guards the transport boundary.

## A VM is still an Agent Server backend

The backend registry's literal `kind: "local"` selects the Agent Server contract. It can point to the laptop, a container or a remote VM; the word does not require a physically local machine. Register personal-cloud VMs using that Agent Server contract and each backend's own host/key.

The existing `kind: "cloud"` adapters represent a different legacy application API contract. They remain compatibility code, rather than the mechanism for registering a personal VM. Those application requests use `callCloudProxy`; conversation runtime requests use typed runtime clients. Do not interchange these transports based on physical hosting location.

## Organize services and hooks

Keep service methods together by feature, with app-specific types beside them when client models are insufficient. Existing APIs include both object services and class-based adapters; use the owning module's convention when extending it.

| Item               | Location or convention                   |
| ------------------ | ---------------------------------------- |
| Feature service    | `feature-service/feature-service.api.ts` |
| App-specific types | `feature-service/feature.types.ts`       |
| Fetch hooks        | `src/hooks/query/`                       |
| Write hooks        | `src/hooks/mutation/`                    |

Components consume hooks rather than initiating transport directly. Query keys must distinguish the backend and conversation identities that affect the result. Keep durable selection state in its existing registry/store owner.

## Compatibility and verification

If an integration requires a new backend endpoint, field or behavior, update `compatibility.minimumAgentServer` in `config/defaults.json` to the first compatible released server version. Updating client types alone does not upgrade deployed backends.

Verify affected adapters, backend switching and conversation runtime overrides. Follow the repository's frontend API guidance for contract changes; this README describes the current service boundary rather than defining a second wire schema.
