import { describe, expect, it, vi } from "vitest";
import { getAgentServerClientOptions } from "#/api/agent-server-client-options";
import { startDeviceFlow } from "#/api/device-flow-client";
import { buildWebSocketUrl } from "#/utils/websocket-url";

describe("hosted Cloud isolation", () => {
  it.each([
    "https://app.all-hands.dev",
    "https://APP.OPENHANDS.DEV.",
    "https://abc.prod-runtime.all-hands.dev",
  ])("rejects %s before forwarding credentials", (host) => {
    expect(() =>
      getAgentServerClientOptions({ host, apiKey: "test-key" }),
    ).toThrow(/OpenHands Cloud/);
  });
  it("rejects device authorization before fetch", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    await expect(startDeviceFlow("https://app.all-hands.dev")).rejects.toThrow(
      /OpenHands Cloud/,
    );
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });
  it("does not construct hosted runtime WebSockets", () => {
    expect(
      buildWebSocketUrl(
        "conv",
        "https://runtime.all-hands.dev/api/conversations/conv",
      ),
    ).toBeNull();
  });
  it("keeps personal backend connections", () => {
    expect(
      getAgentServerClientOptions({
        host: "http://192.168.1.5:8000",
        apiKey: "test",
      }).host,
    ).toBe("http://192.168.1.5:8000");
  });
});
