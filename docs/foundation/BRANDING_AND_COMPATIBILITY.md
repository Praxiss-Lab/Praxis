# Branding and Upstream Compatibility

Status: FOUNDATION DECISION

## Product identity

The public product and repository name is **Praxis**.

Tagline:

**AI-Driven Development**

Praxis is an independent MIT-licensed fork of OpenHands.

## Compatibility rule

Praxis intentionally does **not** rename every inherited OpenHands technical
identifier during Foundation.

Examples that may remain temporarily or permanently for compatibility include:

- `@openhands/agent-canvas` package identity;
- `.openhands` state/configuration paths;
- OpenHands Agent Server package names;
- OpenHands SDK/client package names;
- internal symbols whose renaming would create high upstream-integration cost.

This is deliberate. Product branding and internal compatibility identifiers are
different concerns.

## What is Praxis-owned now

- repository: `Emilio-01-T/Praxis`;
- product name: Praxis;
- independent version marker: `PRAXIS_VERSION`;
- container publication namespace: `ghcr.io/emilio-01-t/praxis`;
- upstream integration policy;
- engineering policy;
- Praxis CI.

## What remains upstream-derived

The application source is still substantially OpenHands Agent Canvas code.
OpenHands copyright and MIT licensing are preserved.

Upstream dependencies such as OpenHands Agent Server, SDK/client packages, and
automation packages remain dependencies until a later explicit architectural
decision changes that boundary.

## Future renaming rule

Internal identifiers are renamed only when one of the following is true:

1. the identifier is user-facing and causes product confusion;
2. Praxis owns the component and no longer needs upstream name compatibility;
3. retaining the identifier creates a correctness, packaging, or security
   problem;
4. the migration cost has been explicitly accepted.

Cosmetic bulk renaming is not a Foundation objective because it increases merge
conflicts without improving product behavior.
