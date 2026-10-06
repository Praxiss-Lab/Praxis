// @vitest-environment node
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  symlinkSync,
  cpSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { server } from "#/mocks/node";

describe("Frontend-only Docker entrypoint", () => {
  it("serves the app and proxies auth and runtime metadata without embedding a backend key", async () => {
    server.close(); // Exercise real HTTP instead of application-wide MSW fixtures.
    const dir = mkdtempSync(path.join(tmpdir(), "praxis-frontend-"));
    const requests: { path: string; key?: string }[] = [];
    const metadata = {
      runtime_services: {
        mode: "docker:backend",
        services: { automation: { url_from_agent: "http://backend:8000" } },
      },
    };
    const backend = createServer((req, res) => {
      requests.push({
        path: req.url!,
        key: req.headers["x-session-api-key"] as string,
      });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(metadata));
    });
    await new Promise<void>((resolve) =>
      backend.listen(0, "127.0.0.1", resolve),
    );
    const backendPort = (backend.address() as { port: number }).port;
    const reservation = createServer();
    await new Promise<void>((resolve) =>
      reservation.listen(0, "127.0.0.1", resolve),
    );
    const frontendPort = (reservation.address() as { port: number }).port;
    await new Promise<void>((resolve) => reservation.close(() => resolve()));
    mkdirSync(path.join(dir, "frontend"));
    writeFileSync(
      path.join(dir, "frontend/index.html"),
      "<html><head></head><body>Praxis fixture</body></html>",
    );
    cpSync(path.resolve("scripts"), dir, { recursive: true });
    symlinkSync(path.resolve("node_modules"), path.join(dir, "node_modules"));
    const script = readFileSync(
      "docker/frontend-entrypoint.sh",
      "utf8",
    ).replaceAll("/opt/agent-canvas", dir);
    const entry = path.join(dir, "entrypoint.sh");
    writeFileSync(entry, script);
    const child = spawn("bash", [entry], {
      env: {
        ...process.env,
        PORT: String(frontendPort),
        PRAXIS_EDITOR_PATH: "/vscode",
        PRAXIS_BACKEND_URL: "http://127.0.0.1:" + backendPort,
      },
      stdio: "pipe",
    });
    let logs = "";
    child.stderr.on("data", (data) => {
      logs += data;
    });
    try {
      const origin = "http://127.0.0.1:" + frontendPort;
      let html = "";
      for (let i = 0; i < 50; i++) {
        try {
          html = await (await fetch(origin + "/canvas/")).text();
          break;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      expect(html, logs).toContain("Praxis fixture");
      expect(html).toContain("__AGENT_CANVAS_AUTH_REQUIRED__=true");
      expect(html).not.toContain("__AGENT_CANVAS_SESSION_API_KEY__");
      const info = await (
        await fetch(origin + "/server_info", {
          headers: { "X-Session-API-Key": "test-key" },
        })
      ).json();
      expect(info).toEqual(metadata);
      await fetch(origin + "/api/automation/openapi.json", {
        headers: { "X-Session-API-Key": "test-key" },
      });
      await fetch(origin + "/vscode/", {
        headers: { "X-Session-API-Key": "test-key" },
      });
      expect(requests).toEqual([
        { path: "/server_info", key: "test-key" },
        { path: "/api/automation/openapi.json", key: "test-key" },
        { path: "/vscode/", key: "test-key" },
      ]);
    } finally {
      const stopped =
        child.exitCode !== null
          ? Promise.resolve()
          : new Promise<void>((resolve) => child.once("exit", () => resolve()));
      child.kill("SIGTERM");
      await stopped;
      backend.closeAllConnections();
      await new Promise<void>((resolve) => backend.close(() => resolve()));
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
