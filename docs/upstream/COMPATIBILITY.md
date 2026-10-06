# Upstream Compatibility

Praxis intentionally preserves upstream compatibility where doing so does not
conflict with Praxis architecture.

## Foundation compatibility stance

During the foundation phase, internal OpenHands package names, configuration
keys, paths, and protocol identifiers are left unchanged unless a change is
required for correctness.

Examples intentionally retained initially:

- `@openhands/*` package dependencies;
- `.openhands/` runtime/state paths;
- `OH_*` environment variables;
- Agent Server API contracts;
- upstream-compatible internal identifiers.

Branding and repository identity may say Praxis while compatibility-sensitive
internal names remain OpenHands-derived.

## Why

Aggressive renaming creates unnecessary merge conflicts and makes selective
upstream integration harder.

Renaming compatibility surfaces requires an explicit architecture decision,
migration plan, and verification.
