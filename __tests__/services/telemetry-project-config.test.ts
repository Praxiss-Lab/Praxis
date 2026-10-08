import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import defaults from "../../config/defaults.json";
const init = vi.hoisted(() => vi.fn());
vi.mock("posthog-js", () => ({ default: { init } }));

describe("JSON analytics project defaults", () => {
  beforeEach(() => {
    vi.resetModules();
    init.mockClear();
    vi.stubEnv("VITE_POSTHOG_API_KEY", "");
    vi.stubEnv("VITE_POSTHOG_HOST", "");
    vi.stubEnv("VITE_POSTHOG_UI_HOST", "");
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllEnvs());
  it("initializes the SDK from JSON without environment configuration", async () => {
    const telemetry = await import("#/services/telemetry");
    await telemetry.initializePostHogClient();
    expect(init).toHaveBeenCalledWith(
      defaults.telemetry.posthogApiKey,
      expect.objectContaining({
        api_host: "https://eu.i.posthog.com",
        ui_host: "https://eu.posthog.com",
        opt_out_capturing_by_default: true,
      }),
      "agent-canvas",
    );
  });
  it("preserves explicit configuration for embedding applications", async () => {
    const telemetry = await import("#/services/telemetry");
    telemetry.configureTelemetry({
      apiKey: "test-project",
      apiHost: "https://analytics.example",
      uiHost: "https://dashboard.example",
    });
    await telemetry.initializePostHogClient();
    expect(init).toHaveBeenCalledWith(
      "test-project",
      expect.objectContaining({
        api_host: "https://analytics.example",
        ui_host: "https://dashboard.example",
      }),
      "agent-canvas",
    );
  });
});
