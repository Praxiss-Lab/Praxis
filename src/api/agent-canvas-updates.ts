/** Read Praxis release metadata and install commands from the owned channel. */
const LATEST_RELEASE_URL =
  "https://api.github.com/repos/Praxiss-Lab/Praxis/releases/latest";

export const AGENT_CANVAS_RELEASE_NOTES_URL =
  "https://github.com/Praxiss-Lab/Praxis/releases";

export type AppUpdateCommands = { npm: string; docker: string };
export type PraxisRelease = { version: string; commands: AppUpdateCommands };

/** Available historical installation, used while release metadata is unavailable. */
export const AGENT_CANVAS_UPDATE_COMMANDS: AppUpdateCommands = {
  npm: "npm install -g https://github.com/Praxiss-Lab/Praxis/releases/download/v1.25.0/openhands-agent-canvas-1.25.0.tgz",
  docker: "docker pull ghcr.io/praxiss-lab/praxis:1.25.0",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function fetchLatestAgentCanvasRelease(
  signal?: AbortSignal,
): Promise<PraxisRelease> {
  const response = await fetch(LATEST_RELEASE_URL, {
    signal,
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    throw new Error(`Praxis release channel responded ${response.status}`);
  }
  const body: unknown = await response.json();
  const tag =
    isRecord(body) && typeof body.tag_name === "string"
      ? body.tag_name.trim()
      : "";
  if (!/^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
    throw new Error("Praxis release response missing version");
  }
  const version = tag.replace(/^v/, "");
  const assets =
    isRecord(body) && Array.isArray(body.assets) ? body.assets : [];
  const archive = assets.find(
    (asset: unknown) =>
      isRecord(asset) &&
      typeof asset.name === "string" &&
      /^[\w.-]+\.tgz$/.test(asset.name),
  );
  if (!isRecord(archive) || typeof archive.browser_download_url !== "string") {
    throw new Error("Praxis release response missing native archive");
  }
  const url = new URL(archive.browser_download_url);
  const expectedPath = `/praxiss-lab/praxis/releases/download/${encodeURIComponent(tag)}/`;
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.username ||
    url.password ||
    url.pathname.toLowerCase() !==
      `${expectedPath}${encodeURIComponent(String(archive.name))}`.toLowerCase() ||
    decodeURIComponent(url.pathname.split("/").at(-1) ?? "") !== archive.name ||
    url.search ||
    url.hash
  ) {
    throw new Error("Praxis release archive must belong to the owned release");
  }
  return {
    version,
    commands: {
      npm: `npm install -g ${url.href}`,
      docker: `docker pull ghcr.io/praxiss-lab/praxis:${version}`,
    },
  };
}

/** Compatibility for consumers that only need the version string. */
export async function fetchLatestAgentCanvasVersion(
  signal?: AbortSignal,
): Promise<string> {
  return (await fetchLatestAgentCanvasRelease(signal)).version;
}
