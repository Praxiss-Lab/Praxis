import { describe, expect, it } from "vitest";
import { ANALYTICS_HANDLERS } from "#/mocks/analytics-handlers";

describe("analytics stay inside mock mode", () => {
  it.each([
    ["POST", "https://eu.i.posthog.com/i/v0/e/?ip=1"],
    ["POST", "https://us.i.posthog.com/e"],
    ["GET", "https://eu-assets.i.posthog.com/static/recorder.js"],
    ["POST", "https://z.openhands.dev/flags/?v=2"],
  ])("intercepts %s %s without network transport", async (method, url) => {
    const request = new Request(url, { method });
    let response: Response | undefined;
    for (const handler of ANALYTICS_HANDLERS) {
      const result = await handler.run({
        request,
        requestId: "analytics-test",
      });
      if (result?.response) {
        response = result.response;
        break;
      }
    }
    expect(response?.status).toBe(200);
  });
});
