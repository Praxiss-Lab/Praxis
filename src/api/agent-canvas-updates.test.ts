import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchLatestAgentCanvasRelease,
  fetchLatestAgentCanvasVersion,
} from "./agent-canvas-updates";

function stubFetchResponse(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue(response as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLatestAgentCanvasVersion", () => {
  it("fetches the owned GitHub release and returns the trimmed version", async () => {
    const fetchMock = stubFetchResponse({
      ok: true,
      json: async () => ({
        tag_name: " v1.6.0 ",
        assets: [
          {
            name: "praxis-1.6.0.tgz",
            browser_download_url:
              "https://github.com/Praxiss-Lab/Praxis/releases/download/v1.6.0/praxis-1.6.0.tgz",
          },
        ],
      }),
    });

    await expect(fetchLatestAgentCanvasVersion()).resolves.toBe("1.6.0");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/Praxiss-Lab/Praxis/releases/latest",
      expect.objectContaining({
        headers: { Accept: "application/vnd.github+json" },
      }),
    );
  });

  it("rejects when the registry responds with an error status", async () => {
    stubFetchResponse({ ok: false, status: 503 });

    await expect(fetchLatestAgentCanvasVersion()).rejects.toThrow("503");
  });

  it("rejects when the response has no usable version field", async () => {
    stubFetchResponse({ ok: true, json: async () => ({ tag_name: 42 }) });

    await expect(fetchLatestAgentCanvasVersion()).rejects.toThrow(
      "missing version",
    );
  });
});

describe("owned release installation", () => {
  it("uses the actual archive and matching Docker version", async () => {
    stubFetchResponse({
      ok: true,
      json: async () => ({
        tag_name: "v1.25.1",
        assets: [
          {
            name: "praxiss-lab-praxis-1.25.1.tgz",
            browser_download_url:
              "https://github.com/Praxiss-Lab/Praxis/releases/download/v1.25.1/praxiss-lab-praxis-1.25.1.tgz",
          },
        ],
      }),
    });
    const release = await fetchLatestAgentCanvasRelease();
    expect(release.commands.npm).toContain(
      "/v1.25.1/praxiss-lab-praxis-1.25.1.tgz",
    );
    expect(release.commands.docker).toBe(
      "docker pull ghcr.io/praxiss-lab/praxis:1.25.1",
    );
  });

  it.each([
    "https://github.com/other/repo/releases/download/v1.25.1/praxis.tgz",
    "https://github.com/Praxiss-Lab/Praxis/releases/download/v1.25.1/extra;command/praxis.tgz",
  ])("rejects an archive outside the exact owned asset path", async (url) => {
    stubFetchResponse({
      ok: true,
      json: async () => ({
        tag_name: "v1.25.1",
        assets: [{ name: "praxis.tgz", browser_download_url: url }],
      }),
    });
    await expect(fetchLatestAgentCanvasRelease()).rejects.toThrow(
      "owned release",
    );
  });
});
