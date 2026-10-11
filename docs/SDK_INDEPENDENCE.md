# Praxis SDK independence

Praxis uses `Praxiss-Lab/praxis-sdk` at the exact revision in `config/defaults.json`. All four Python SDK packages are taken from the same source revision, including the packages used by bundled Automation. Python import names and npm package names remain compatible during this initial migration.

The TypeScript client and extensions are controlled local archives in `vendor/`. Automation is a controlled source snapshot at `vendor/automation`. Installation no longer selects published OpenHands SDK, Automation or extensions releases by default. Unrelated third-party dependencies still use their configured registries.

For private repositories, authenticate Git using your owner account with access to the organization. Do not put tokens in repository URLs or configuration files. Cross-repository CI needs the `PRAXIS_SDK_READ_TOKEN` secret with read access to the private SDK; the ordinary Praxis workflow token cannot read another private repository. No credential is committed here.

Run `npm ci`, `node scripts/check-sdk-version-sync.mjs`, then `npm run dev`. For a local SDK checkout set `OH_AGENT_SERVER_LOCAL_PATH`; both services will use that source. Repository/reference overrides must point to your controlled sources.

Docker builds the source image from the configured SDK revision before building Praxis. For private repositories authenticate Git before local builds. Default image names belong to Praxiss-Lab and require our own image publication. Desktop packaging includes bundled Automation.

The SDK has no implicit hosted LLM proxy, critic or public skills repository. Configure your own endpoint or direct model provider. Cloud backend login requires an explicit compatible server URL. Legacy saved endpoints and explicitly configured compatibility integrations remain available and must be reviewed by the deployment owner. This migration does not provision a hosted Praxis cloud, remove all open-source dependencies, or automatically fix inherited bugs.

Repository visibility remains unchanged. Original license and copyright notices are preserved.

Set `VITE_PRODUCT_URL` only when operating a compatible hosted deployment. Without it, responder integration links open the deployment guide and no domain is treated as the hosted production service.
