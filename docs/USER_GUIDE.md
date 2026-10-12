# Praxis configuration and extensions

Praxis runs on your own host or container. Configure a reachable personal backend
in Backends and enter the session key issued by that deployment. A backend key is
separate from a model-provider key. Hosted OpenHands Cloud is unsupported.

## Models and profiles

Create an LLM profile with the provider, model and provider credential you intend
to use. For a personal proxy, also enter its explicit base URL. Select that profile
in your agent configuration. Existing historical routing identifiers may still
load, but they do not enable a hosted endpoint.

## Skills and MCP

Install skills from a reviewed local directory or repository you control. Read
SKILL.md and its scripts before installation. Configure MCP servers and their
credentials explicitly; enabling an extension does not grant a hosted account.

## Automation and exported interfaces

Automation is provided by the backend deployed with Praxis. Configure schedules,
webhooks, credentials and permissions on that backend. Exported manifests must
match the versioned interface contract; inspect the schema and validation errors
before importing. See [automation operations](AGENT_OPERATIONS.md) and
[extension validation](CANVAS_EXTENSIONS_TESTING.md).

## Installation and updates

Use the [distribution guide](distribution/README.md) and
[self-hosting guide](SELF_HOSTING.md). The update indicator reads Praxiss-Lab
GitHub releases. Historical release assets retain their original filenames;
package renaming changes future artifacts, not files already published.

## Support

Report issues at https://github.com/Praxiss-Lab/Praxis/issues. Include the Praxis
and SDK versions and sanitized logs; omit model keys and backend session keys.
