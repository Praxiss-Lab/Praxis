import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const init = vi.hoisted(() => vi.fn());
vi.mock("posthog-js", () => ({ default: { init } }));

describe("Owner-configured analytics destination", () => {
  beforeEach(() => {
    vi.resetModules();
    init.mockClear();
    vi.stubEnv("VITE_POSTHOG_API_KEY", "");
    vi.stubEnv("VITE_POSTHOG_HOST", "");
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllEnvs());
  it("has no destination even when consent was previously granted", async () => {
    localStorage.setItem("openhands-telemetry-consent", "granted");
    const telemetry = await import("#/services/telemetry");
    await telemetry.trackInstall();
    expect(await telemetry.initializePostHogClient()).toBeNull();
    expect(init).not.toHaveBeenCalled();
  });
  it("does not fall back to an upstream proxy for a key without a host", async () => {
    const telemetry = await import("#/services/telemetry");
    telemetry.configureTelemetry({ apiKey: "test-project" });
    expect(await telemetry.initializePostHogClient()).toBeNull();
    expect(init).not.toHaveBeenCalled();
  });
});
