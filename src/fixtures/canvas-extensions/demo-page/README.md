# Praxis demo page extension

A dependency-free browser ES module fixture for the Canvas extension host API v1. The manifest is `canvas-extension.json`; `extension.js` is its entrypoint.

The extension contributes a page with ID `hello`, route `/hello` and navigation label **Extension demo**. It demonstrates page registration without adding a build step or external dependencies.

Use this fixture with the [extension manual testing guide](../../../../docs/CANVAS_EXTENSIONS_TESTING.md). Registration and loading require the extension-capable backend/host described there; copying this directory alone does not install it.
