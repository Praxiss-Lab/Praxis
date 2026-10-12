# Hosted-service isolation

Praxis uses operator-managed backends, locally or on personal VMs. Frontend and
backend can remain on separate devices; native and all/backend/frontend Docker
modes retain their existing contracts.

## Boundaries

The frontend rejects upstream hosted hosts before constructing authenticated
Agent Server, App API, automation, OAuth device-flow and runtime requests. It
also refuses hosted WebSockets and validates device verification URLs. Backend
registry entries and stored credentials are not deleted; an unsupported entry
cannot be used to send requests and can be edited to an operator-managed host.
The inherited `kind: cloud` identifies a compatible App API transport, not a
subscription to a hosted service and not an App API server implemented here.
Personal Agent Servers continue to use the Agent Server transport on any host.

The Automation snapshot validates configured service and provisioning endpoints.
Local automation requires no upstream account. Python runtime isolation is owned
by the SDK snapshot pinned in `config/defaults.json`; install both coordinated
changes together. The optional live E2E runner selects direct-provider defaults
for provider-specific credentials and requires an explicit model for a generic
key. It no longer chooses an upstream proxy URL. These changes do not launch paid
model runs, delete saved jobs or publish images/packages.

## Verification

Isolation tests stub network operations and verify rejection before credentials
are sent. Positive transport fixtures use example self-hosted domains. Test
analytics requests are simulated, and unmocked external MSW traffic is rejected.
Runtime telemetry remains configured for the Praxis owner project.
Native Agent Server startup was exercised locally with VS Code and tool preload
disabled: `/health`, `/server_info` and `/api/settings` returned HTTP 200, without
OpenHands Cloud credentials. Live model inference, Docker execution and external
MCP/provider behavior require their own environment-specific checks.

## Compatibility and rebranding

Domain-denial entries, historical migration fixtures and original license notices
are retained deliberately. Technical namespace/data identifiers are migrated in
the separate rebranding change. Isolation is application routing policy rather
than a system-wide egress firewall; operator gateways and arbitrary tools can
have their own network behavior.
